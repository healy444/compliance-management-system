<?php

namespace App\Policies;

use App\Models\Position;
use App\Models\User;

class PositionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function view(User $user, Position $position): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function update(User $user, Position $position): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }

    public function delete(User $user, Position $position): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Compliance & Admin Specialist']);
    }
}
