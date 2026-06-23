<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function topBooked(Request $request): JsonResponse
    {
        $limit = min((int) $request->query('limit', 6), 20);

        $services = Service::active()
            ->with('category:id,name')
            ->orderByDesc('booking_count')
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data'    => ServiceResource::collection($services),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Service::active()->with('category:id,name');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return response()->json([
            'success' => true,
            'data'    => ServiceResource::collection($query->get()),
        ]);
    }

    public function show(Service $service): JsonResponse
    {
        if (!$service->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Service not found.',
            ], 404);
        }

        $service->load('category:id,name');

        return response()->json([
            'success' => true,
            'data'    => new ServiceResource($service),
        ]);
    }
}
