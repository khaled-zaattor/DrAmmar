<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BarberResource;
use App\Models\Barber;
use App\Support\PublicCache;
use Illuminate\Http\JsonResponse;

class BarberController extends Controller
{
    public function index(): JsonResponse
    {
        $data = PublicCache::remember('barbers:index', function () {
            $barbers = Barber::active()->with('services')->get();

            return BarberResource::collection($barbers)->resolve();
        });

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    public function show(Barber $barber): JsonResponse
    {
        if (!$barber->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Barber not found.',
            ], 404);
        }

        $barber->load('services');

        return response()->json([
            'success' => true,
            'data'    => new BarberResource($barber),
        ]);
    }
}
