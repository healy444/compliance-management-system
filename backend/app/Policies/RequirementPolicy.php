<?php

namespace App\Policies;

use App\Models\Requirement;
use App\Models\User;

class RequirementPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function view(User $user, Requirement $requirement): bool
    {
        if ($user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist'])) {
            return true;
        }

        $userId = $user->id;
        $hasAssignment = $requirement->assignments
            ? $requirement->assignments->where('assigned_to_user_id', $userId)->isNotEmpty()
            : $requirement->assignments()->where('assigned_to_user_id', $userId)->exists();

        if ($hasAssignment) {
            return true;
        }

        $picList = $requirement->person_in_charge_user_ids;
        if (!$picList) {
            return false;
        }

        return str_contains(';' . $picList . ';', ';' . $userId . ';');
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function update(User $user, Requirement $requirement): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function delete(User $user, Requirement $requirement): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }
}
