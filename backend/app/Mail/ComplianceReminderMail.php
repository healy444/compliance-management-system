<?php

namespace App\Mail;

use App\Models\RequirementAssignment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ComplianceReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public RequirementAssignment $assignment;
    public int $offsetDays;

    public function __construct(RequirementAssignment $assignment, int $offsetDays)
    {
        $this->assignment = $assignment->loadMissing(['requirement', 'user']);
        $this->offsetDays = $offsetDays;
    }

    public function build()
    {
        $subject = $this->offsetDays === 1
            ? 'Compliance deadline reminder (24 hours)'
            : 'Compliance deadline reminder (D-' . $this->offsetDays . ')';

        return $this->from(config('mail.from.address'), config('mail.from.name'))
            ->subject($subject)
            ->view('emails.compliance_reminder');
    }
}
