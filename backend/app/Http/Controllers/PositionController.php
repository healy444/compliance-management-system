<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PositionController extends Controller
{
    public function index(Request $request)
    {
        $activeOnly = filter_var($request->query('active_only', false), FILTER_VALIDATE_BOOLEAN);
        $query = Position::query();
        if ($activeOnly) {
            $query->where('is_active', true);
        }
        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:positions,name',
        ]);

        $position = Position::create($validated);
        return response()->json($position, 201);
    }

    public function update(Request $request, Position $position)
    {
        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                Rule::unique('positions', 'name')->ignore($position->id),
            ],
            'is_active' => 'sometimes|boolean',
        ]);

        $position->update($validated);
        return response()->json($position);
    }

    public function destroy(Position $position)
    {
        $position->update(['is_active' => false]);
        return response()->json($position);
    }
}
