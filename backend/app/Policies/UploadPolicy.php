<?php

namespace App\Policies;

use App\Models\Upload;
use App\Models\User;

class UploadPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function view(User $user, Upload $upload): bool
    {
        if ($user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist'])) {
            return true;
        }

        if ($upload->uploaded_by_user_id === $user->id) {
            return true;
        }

        return $upload->assignment && $upload->assignment->assigned_to_user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function approve(User $user, Upload $upload): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function reject(User $user, Upload $upload): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }
}
