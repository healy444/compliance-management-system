<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use Illuminate\Http\Request;

class AgencyController extends Controller
{
    public function index(Request $request)
    {
        $activeOnly = filter_var($request->query('active_only', false), FILTER_VALIDATE_BOOLEAN);
        $query = Agency::query();
        if ($activeOnly) {
            $query->where('is_active', true);
        }
        return response()->json($query->orderBy('agency_id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'agency_id' => 'required|unique:agencies',
            'name' => 'required|string',
        ]);

        $validated['agency_id'] = strtoupper($validated['agency_id']);
        $agency = Agency::create($validated);
        return response()->json($agency, 211);
    }

    public function show(Agency $agency)
    {
        return response()->json($agency->load('requirements'));
    }

    public function update(Request $request, Agency $agency)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $agency->update($validated);
        return response()->json($agency);
    }

    public function destroy(Agency $agency)
    {
        $agency->update(['is_active' => false]);
        return response()->json($agency);
    }
}
