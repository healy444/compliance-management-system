<?php

namespace App\Mail;

use App\Models\Upload;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SubmissionPendingReviewMail extends Mailable
{
    use Queueable, SerializesModels;

    public Upload $upload;

    public function __construct(Upload $upload)
    {
        $this->upload = $upload->loadMissing(['requirement', 'assignment.user', 'uploader']);
    }

    public function build()
    {
        return $this->from(config('mail.from.address'), config('mail.from.name'))
            ->subject('Submission pending review')
            ->view('emails.submission_pending_review');
    }
}
