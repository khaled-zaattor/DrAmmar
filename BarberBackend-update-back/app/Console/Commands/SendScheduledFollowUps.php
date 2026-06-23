<?php

namespace App\Console\Commands;

use App\Jobs\SendFollowUpEmail;
use App\Models\EmailFollowUp;
use Illuminate\Console\Command;

class SendScheduledFollowUps extends Command
{
    protected $signature = 'emails:send-follow-ups';

    protected $description = 'Dispatch queued jobs for all pending follow-up emails that are due to be sent';

    public function handle(): int
    {
        $count = 0;

        EmailFollowUp::pending()->due()
            ->chunkById(50, function ($followUps) use (&$count) {
                foreach ($followUps as $followUp) {
                    SendFollowUpEmail::dispatch($followUp);
                    $count++;
                }
            });

        $this->info("Dispatched {$count} follow-up email job(s).");

        return Command::SUCCESS;
    }
}
