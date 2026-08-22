<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\ClientVisitCount;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ClientVisitCountService
{
    public function __construct(
        private readonly ClientIdentifierNormalizer $normalizer
    ) {}

    /**
     * Count every pending, confirmed, or completed appointment identifier that is
     * not already in the ledger.
     *
     * @return array{processed_new_phone: int, processed_new_email: int, skipped_invalid: int, calculated_at: CarbonInterface}
     */
    public function sync(): array
    {
        $calculatedAt = now();
        $processedPhone = 0;
        $processedEmail = 0;
        $skippedInvalid = 0;

        DB::transaction(function () use ($calculatedAt, &$processedPhone, &$processedEmail, &$skippedInvalid) {
            Appointment::query()
                ->whereIn('status', ['pending', 'confirmed', 'completed'])
                ->select(['id', 'customer_phone', 'customer_email'])
                ->orderBy('id')
                ->chunkById(200, function (EloquentCollection $appointments) use (
                    $calculatedAt,
                    &$processedPhone,
                    &$processedEmail,
                    &$skippedInvalid
                ) {
                    foreach ($appointments as $appointment) {
                        $identifiers = [
                            'phone' => $this->normalizer->phone($appointment->customer_phone),
                            'email' => $this->normalizer->email($appointment->customer_email),
                        ];

                        foreach ($identifiers as $type => $identifier) {
                            if ($identifier === null) {
                                $skippedInvalid++;

                                continue;
                            }

                            DB::table('client_visit_counts')->insertOrIgnore([
                                'identifier_type' => $type,
                                'normalized_identifier' => $identifier,
                                'visit_count' => 0,
                                'last_calculated_at' => null,
                                'created_at' => $calculatedAt,
                                'updated_at' => $calculatedAt,
                            ]);

                            $summary = ClientVisitCount::query()
                                ->where('identifier_type', $type)
                                ->where('normalized_identifier', $identifier)
                                ->lockForUpdate()
                                ->firstOrFail();

                            $ledgerInserted = DB::table('counted_appointment_visits')->insertOrIgnore([
                                'source_appointment_id' => $appointment->id,
                                'client_visit_count_id' => $summary->id,
                                'identifier_type' => $type,
                                'normalized_identifier' => $identifier,
                                'counted_at' => $calculatedAt,
                                'created_at' => $calculatedAt,
                                'updated_at' => $calculatedAt,
                            ]);

                            if ($ledgerInserted !== 1) {
                                continue;
                            }

                            $summary->increment('visit_count', 1, [
                                'last_calculated_at' => $calculatedAt,
                                'updated_at' => $calculatedAt,
                            ]);

                            if ($type === 'phone') {
                                $processedPhone++;
                            } else {
                                $processedEmail++;
                            }
                        }
                    }
                });
        }, 3);

        return [
            'processed_new_phone' => $processedPhone,
            'processed_new_email' => $processedEmail,
            'skipped_invalid' => $skippedInvalid,
            'calculated_at' => $calculatedAt,
        ];
    }

    public function attachToAppointments(Collection $appointments): void
    {
        if ($appointments->isEmpty()) {
            return;
        }

        $normalized = [];
        $phoneIdentifiers = [];
        $emailIdentifiers = [];

        foreach ($appointments as $appointment) {
            $phone = $this->normalizer->phone($appointment->customer_phone);
            $email = $this->normalizer->email($appointment->customer_email);
            $normalized[$appointment->id] = ['phone' => $phone, 'email' => $email];

            if ($phone !== null) {
                $phoneIdentifiers[] = $phone;
            }

            if ($email !== null) {
                $emailIdentifiers[] = $email;
            }
        }

        $summaries = collect();

        if ($phoneIdentifiers !== [] || $emailIdentifiers !== []) {
            $summaries = ClientVisitCount::query()
                ->where(function ($query) use ($phoneIdentifiers, $emailIdentifiers) {
                    if ($phoneIdentifiers !== []) {
                        $query->where(function ($phoneQuery) use ($phoneIdentifiers) {
                            $phoneQuery->where('identifier_type', 'phone')
                                ->whereIn('normalized_identifier', array_unique($phoneIdentifiers));
                        });
                    }

                    if ($emailIdentifiers !== []) {
                        $method = $phoneIdentifiers === [] ? 'where' : 'orWhere';
                        $query->{$method}(function ($emailQuery) use ($emailIdentifiers) {
                            $emailQuery->where('identifier_type', 'email')
                                ->whereIn('normalized_identifier', array_unique($emailIdentifiers));
                        });
                    }
                })
                ->get()
                ->keyBy(fn (ClientVisitCount $summary) => $summary->identifier_type.'|'.$summary->normalized_identifier);
        }

        foreach ($appointments as $appointment) {
            foreach (['phone', 'email'] as $type) {
                $identifier = $normalized[$appointment->id][$type];
                $summary = $identifier === null ? null : $summaries->get($type.'|'.$identifier);

                $appointment->setAttribute(
                    "{$type}_visit_count",
                    $identifier === null ? null : ($summary?->visit_count ?? 0)
                );
                $appointment->setAttribute(
                    "{$type}_visit_count_updated_at",
                    $summary?->last_calculated_at
                );
            }
        }
    }
}
