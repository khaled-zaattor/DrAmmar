<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Services\ClientIdentifierNormalizer;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerExportController extends Controller
{
    public function __construct(
        private readonly ClientIdentifierNormalizer $normalizer
    ) {}

    /**
     * Export unique customers as a Google Ads Customer Match CSV, so existing
     * clients can be excluded from ad campaigns.
     */
    public function export(): StreamedResponse
    {
        $filename = 'customer-match-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Email', 'Phone', 'First Name', 'Last Name', 'Country']);

            $seen = [];

            $appointments = Appointment::query()
                ->select(['customer_name', 'customer_email', 'customer_phone'])
                ->where('status', '!=', 'cancelled')
                ->orderByDesc('id')
                ->cursor();

            foreach ($appointments as $appointment) {
                $email = $this->normalizer->email($appointment->customer_email);
                $phone = $this->normalizer->phone($appointment->customer_phone);

                if ($email === null && $phone === null) {
                    continue;
                }

                $keys = array_filter(['e:'.$email => $email, 'p:'.$phone => $phone]);
                if (array_intersect_key($seen, $keys)) {
                    continue;
                }
                $seen += array_fill_keys(array_keys($keys), true);

                $parts = preg_split('/\s+/', trim((string) $appointment->customer_name), 2);

                fputcsv($out, [
                    $email ?? '',
                    $phone ?? '',
                    $parts[0] ?? '',
                    $parts[1] ?? '',
                    'US',
                ]);
            }

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
