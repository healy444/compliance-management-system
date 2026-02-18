<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Requirement;
use App\Models\AuditLog;
use App\Models\Upload;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalRequirements = Requirement::count();
        $totalAgencies = Agency::count();

        $compliantCount = Requirement::whereNotNull('deadline')
            ->whereHas('assignments')
            ->whereDoesntHave('assignments', function ($query) {
                $query->where('compliance_status', '!=', 'APPROVED');
            })
            ->count();

        $overdueCount = Requirement::whereNotNull('deadline')
            ->whereHas('assignments', function ($query) {
                $query->where('compliance_status', 'OVERDUE');
            })->count();

        $pendingCount = Requirement::whereNotNull('deadline')
            ->where(function ($query) {
                $query->whereDoesntHave('assignments')
                    ->orWhere(function ($subQuery) {
                        $subQuery->whereHas('assignments', function ($assignmentQuery) {
                            $assignmentQuery->where('compliance_status', '!=', 'APPROVED');
                        })->whereDoesntHave('assignments', function ($assignmentQuery) {
                            $assignmentQuery->where('compliance_status', 'OVERDUE');
                        });
                    });
            })->count();

        $forApprovalCount = Upload::where('approval_status', 'PENDING')->count();

        $complianceRate = $totalRequirements > 0
            ? round(($compliantCount / $totalRequirements) * 100, 1)
            : 0;

        return response()->json([
            'total_agencies' => $totalAgencies,
            'total_requirements' => $totalRequirements,
            'compliant' => $compliantCount,
            'pending' => $pendingCount,
            'overdue' => $overdueCount,
            'for_approval' => $forApprovalCount,
            'compliance_rate' => $complianceRate,
        ]);
    }

    public function activity()
    {
        $logs = AuditLog::with('actor')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json($logs);
    }

    public function complianceByAgency()
    {
        $stats = \App\Models\Agency::with(['requirements.assignments'])
            ->get()
            ->map(function ($agency) {
                $assignments = $agency->requirements->flatMap->assignments;
                $total = $assignments->count();
                $compliant = $assignments->where('compliance_status', 'APPROVED')->count();

                return [
                    'agency' => $agency->agency_id,
                    'name' => $agency->name,
                    'rate' => $total > 0 ? round(($compliant / $total) * 100, 1) : 0,
                    'total' => $total,
                ];
            });

        return response()->json($stats);
    }
}
