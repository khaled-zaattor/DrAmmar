<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barber;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * GET /api/admin/users
     */
    public function index(): JsonResponse
    {
        $users = User::with('barber:id,user_id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'is_active', 'created_at']);

        return response()->json([
            'success' => true,
            'data'    => $users,
        ]);
    }

    /**
     * GET /api/admin/users/linkable-barbers
     * Returns barbers not yet linked to any user, plus the one linked to $exceptUserId if provided.
     */
    public function linkableBarbers(Request $request): JsonResponse
    {
        $exceptUserId = $request->query('except_user_id');

        $barbers = Barber::orderBy('name')
            ->where(function ($q) use ($exceptUserId) {
                // Unlinked barbers
                $q->whereNull('user_id');
                // Also include the barber already linked to this user (for edit form)
                if ($exceptUserId) {
                    $q->orWhere('user_id', $exceptUserId);
                }
            })
            ->get(['id', 'name', 'user_id']);

        return response()->json([
            'success' => true,
            'data'    => $barbers,
        ]);
    }

    /**
     * POST /api/admin/users
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|max:255|unique:users,email',
            'password'  => 'required|string|min:8',
            'role'      => ['required', Rule::in(['admin', 'receptionist', 'barber'])],
            'is_active' => 'boolean',
            'barber_id' => 'nullable|integer|exists:barbers,id',
        ]);

        $user = User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'password'  => $validated['password'], // hashed by cast
            'role'      => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Link barber profile if role is barber and barber_id provided
        if ($validated['role'] === 'barber' && !empty($validated['barber_id'])) {
            Barber::where('id', $validated['barber_id'])
                ->whereNull('user_id')
                ->update(['user_id' => $user->id]);
        }

        $user->load('barber:id,user_id,name');

        return response()->json([
            'success' => true,
            'message' => 'User created successfully.',
            'data'    => array_merge(
                $user->only(['id', 'name', 'email', 'role', 'is_active', 'created_at']),
                ['barber' => $user->barber]
            ),
        ], 201);
    }

    /**
     * PUT /api/admin/users/{user}
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        $validated = $request->validate([
            'name'      => 'sometimes|required|string|max:255',
            'email'     => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role'      => ['sometimes', Rule::in(['admin', 'receptionist', 'barber'])],
            'is_active' => 'sometimes|boolean',
            'barber_id' => 'sometimes|nullable|integer|exists:barbers,id',
        ]);

        // Cannot change your own role
        if (isset($validated['role']) && $user->id === $currentUser->id) {
            unset($validated['role']);
        }

        // Cannot disable yourself
        if (isset($validated['is_active']) && !$validated['is_active'] && $user->id === $currentUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot disable your own account.',
            ], 422);
        }

        // Handle barber link changes
        if (array_key_exists('barber_id', $validated)) {
            $newBarberId = $validated['barber_id'];

            // Unlink any barber currently linked to this user
            Barber::where('user_id', $user->id)->update(['user_id' => null]);

            // Link the new barber if provided and role is/will be barber
            $effectiveRole = $validated['role'] ?? $user->role;
            if ($newBarberId && $effectiveRole === 'barber') {
                Barber::where('id', $newBarberId)
                    ->whereNull('user_id')
                    ->update(['user_id' => $user->id]);
            }

            unset($validated['barber_id']);
        } elseif (isset($validated['role']) && $validated['role'] !== 'barber') {
            // Role changed away from barber — unlink any linked barber
            Barber::where('user_id', $user->id)->update(['user_id' => null]);
        }

        $user->update($validated);

        $user->load('barber:id,user_id,name');

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'data'    => array_merge(
                $user->fresh()->only(['id', 'name', 'email', 'role', 'is_active', 'created_at']),
                ['barber' => $user->barber]
            ),
        ]);
    }

    /**
     * PUT /api/admin/users/{user}/password
     */
    public function changePassword(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user->update(['password' => $request->new_password]); // hashed by cast

        // Revoke all existing tokens so the user must log in again
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully. The user must log in again.',
        ]);
    }

    /**
     * DELETE /api/admin/users/{user}
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        // Revoke all tokens before deleting
        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }
}
