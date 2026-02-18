<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Compliance Reminder</title>
</head>
<body>
    <p>Hi {{ $assignment->user?->employee_name ?? 'PIC' }},</p>

    <p>This is a reminder that the following compliance requirement is due soon:</p>

    <ul>
        <li><strong>Requirement:</strong> {{ $assignment->requirement?->requirement ?? 'N/A' }}</li>
        <li><strong>Deadline:</strong> {{ $assignment->deadline ? $assignment->deadline->format('F j, Y') : 'Not set' }}</li>
        <li><strong>Days left:</strong> {{ $offsetDays === 1 ? '24 hours' : ('D-' . $offsetDays) }}</li>
        <li><strong>Status:</strong> {{ $assignment->compliance_status ?? 'PENDING' }}</li>
    </ul>

    <p>Please submit your compliance documents before the deadline to avoid delays.</p>

    <p>Thank you,<br>Compliance Team</p>
</body>
</html>
