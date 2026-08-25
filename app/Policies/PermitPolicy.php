<?php

namespace App\Policies;

use App\Models\Permit;
use App\Models\User;

class PermitPolicy
{
    public function view(User $user, Permit $permit): bool
    {
        return $permit->applicant_id === $user->id
            || $user->isSuperAdmin()
            || ($user->canReviewPermits()
                && ($permit->lgu_id ? $permit->lgu_id === $user->lgu_id : true)
                && ($permit->agency_id && $user->agency_id ? $permit->agency_id === $user->agency_id : true));
    }

    public function review(User $user, Permit $permit): bool
    {
        return $user->canReviewPermits();
    }

    public function create(User $user): bool
    {
        return true;
    }
}
