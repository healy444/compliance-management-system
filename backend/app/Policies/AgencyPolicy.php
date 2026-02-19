<?php

namespace App\Policies;

use App\Models\Agency;
use App\Models\User;

class AgencyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function view(User $user, Agency $agency): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function update(User $user, Agency $agency): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function delete(User $user, Agency $agency): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }
}
