<?php

namespace App\Http\Controllers;

use App\Models\BranchUnitDepartment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BranchUnitDepartmentController extends Controller
{
    public function index(Request $request)
    {
        $activeOnly = filter_var($request->query('active_only', false), FILTER_VALIDATE_BOOLEAN);
        $query = BranchUnitDepartment::query();
        if ($activeOnly) {
            $query->where('is_active', true);
        }
        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:branch_unit_departments,name',
        ]);

        $department = BranchUnitDepartment::create($validated);
        return response()->json($department, 201);
    }

    public function update(Request $request, BranchUnitDepartment $branchUnitDepartment)
    {
        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                Rule::unique('branch_unit_departments', 'name')->ignore($branchUnitDepartment->id),
            ],
            'is_active' => 'sometimes|boolean',
        ]);

        $branchUnitDepartment->update($validated);
        return response()->json($branchUnitDepartment);
    }

    public function destroy(BranchUnitDepartment $branchUnitDepartment)
    {
        $branchUnitDepartment->update(['is_active' => false]);
        return response()->json($branchUnitDepartment);
    }
}
