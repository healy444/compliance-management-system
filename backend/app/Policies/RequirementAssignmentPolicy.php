<?php

namespace App\Policies;

use App\Models\RequirementAssignment;
use App\Models\User;

class RequirementAssignmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function view(User $user, RequirementAssignment $requirementAssignment): bool
    {
        if ($user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist'])) {
            return true;
        }

        return $requirementAssignment->assigned_to_user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function update(User $user, RequirementAssignment $requirementAssignment): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function delete(User $user, RequirementAssignment $requirementAssignment): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }
}
