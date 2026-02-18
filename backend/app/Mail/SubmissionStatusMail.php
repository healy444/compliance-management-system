<?php

namespace App\Mail;

use App\Models\Upload;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SubmissionStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public Upload $upload;

    public function __construct(Upload $upload)
    {
        $this->upload = $upload->loadMissing(['requirement', 'assignment.user', 'uploader']);
    }

    public function build()
    {
        $status = strtoupper((string) $this->upload->approval_status);
        $subject = $status === 'APPROVED'
            ? 'Submission approved'
            : 'Submission rejected';

        return $this->from(config('mail.from.address'), config('mail.from.name'))
            ->subject($subject)
            ->view('emails.submission_status');
    }
}
