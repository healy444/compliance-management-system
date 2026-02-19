<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function view(User $user, User $target): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function update(User $user, User $target): bool
    {
        if ($target->user_type === 'Super Admin' || $target->roles->contains('name', 'Super Admin')) {
            return $user->hasRole('Super Admin');
        }

        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function delete(User $user, User $target): bool
    {
        return $this->update($user, $target);
    }

    public function resetPassword(User $user, User $target): bool
    {
        if ($user->hasRole('Super Admin')) {
            return true;
        }

        $isPicTarget = $target->user_type === 'Person-in-Charge'
            || $target->roles->contains('name', 'Person-In-Charge (PIC)');

        return $user->hasRole('Compliance & Admin Specialist') && $isPicTarget;
    }
}
