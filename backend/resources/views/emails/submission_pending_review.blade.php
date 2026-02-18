<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Submission Pending Review</title>
</head>
<body>
    <p>Hello Specialist,</p>

    <p>A new compliance submission is waiting for your review:</p>

    <ul>
        <li><strong>Requirement:</strong> {{ $upload->requirement?->requirement ?? 'N/A' }}</li>
        <li><strong>Submitted by:</strong> {{ $upload->uploader?->employee_name ?? $upload->uploader_email ?? 'N/A' }}</li>
        <li><strong>Submitted on:</strong> {{ $upload->upload_date ? $upload->upload_date->format('F j, Y g:i A') : 'N/A' }}</li>
        <li><strong>Status:</strong> {{ $upload->approval_status }}</li>
    </ul>

    <p>Please review and approve or reject the submission.</p>

    <p>Thank you,<br>Compliance Team</p>
</body>
</html>
