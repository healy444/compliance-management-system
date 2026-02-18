<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use App\Models\RequirementAssignment;
use App\Mail\ComplianceReminderMail;

class SendComplianceReminders extends Command
{
    protected $signature = 'compliance:send-reminders';
    protected $description = 'Send compliance reminders to PICs';

    public function handle()
    {
        $offsets = [30, 14, 7, 1];

        foreach ($offsets as $offset) {
            $targetDate = Carbon::today()->addDays($offset);

            $assignments = RequirementAssignment::with(['requirement', 'user'])
                ->whereDate('deadline', $targetDate)
                ->where('compliance_status', '!=', 'APPROVED')
                ->get();

            foreach ($assignments as $assignment) {
                $pic = $assignment->user;
                if (!$pic || !$pic->email) {
                    continue;
                }

                Mail::to($pic->email)->send(new ComplianceReminderMail($assignment, $offset));
                $this->info("Reminder (D-{$offset}) sent to {$pic->email} for {$assignment->requirement?->requirement}");
            }
        }

        // Compliance status is computed dynamically; no stored updates needed.
    }
}
