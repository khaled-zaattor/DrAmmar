<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Models\Customer;
use App\Services\CustomerResolver;
use Illuminate\Console\Command;

class BackfillCustomers extends Command
{
    protected $signature = 'customers:backfill';

    protected $description = 'Link existing appointments to customer records, matching on email or phone';

    public function handle(CustomerResolver $resolver): int
    {
        $pending = Appointment::whereNull('customer_id')->count();

        if ($pending === 0) {
            $this->info('Nothing to backfill — every appointment is already linked to a customer.');

            return Command::SUCCESS;
        }

        $customersBefore = Customer::count();
        $linked = 0;
        $bar = $this->output->createProgressBar($pending);
        $bar->start();

        // Oldest first, so first_booked_at lands on the earliest real booking.
        // chunkById is safe here even though the filter changes as we go —
        // it pages on the primary key, not an offset.
        Appointment::whereNull('customer_id')
            ->orderBy('id')
            ->chunkById(200, function ($appointments) use ($resolver, &$linked, $bar) {
                foreach ($appointments as $appointment) {
                    $customer = $resolver->resolve([
                        'customer_name'  => $appointment->customer_name,
                        'customer_email' => $appointment->customer_email,
                        'customer_phone' => $appointment->customer_phone,
                    ], $appointment->created_at);

                    // Don't touch updated_at — backfilling shouldn't make every
                    // historical appointment look freshly edited.
                    $appointment->timestamps = false;
                    $appointment->customer_id = $customer->id;
                    $appointment->saveQuietly();

                    $linked++;
                    $bar->advance();
                }
            }, 'id');

        $bar->finish();
        $this->newLine(2);

        $created = Customer::count() - $customersBefore;

        $this->info("Linked {$linked} appointment(s) to {$created} new customer record(s).");
        $this->line('Total customers: ' . Customer::count());

        return Command::SUCCESS;
    }
}
