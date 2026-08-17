<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use App\Support\PublicCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function topBooked(Request $request): JsonResponse
    {
        $limit = min((int) $request->query('limit', 6), 20);

        // ->resolve() so a plain array is cached; a ResourceCollection is not
        // reliably serialisable into the cache store.
        $data = PublicCache::remember("services:top:{$limit}", function () use ($limit) {
            $services = Service::active()
                ->with('category:id,name')
                ->orderByDesc('booking_count')
                ->take($limit)
                ->get();

            return ServiceResource::collection($services)->resolve();
        });

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $categoryId = $request->filled('category_id') ? $request->category_id : 'all';

        $data = PublicCache::remember("services:cat:{$categoryId}", function () use ($request) {
            $query = Service::active()->with('category:id,name');

            if ($request->filled('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            return ServiceResource::collection($query->get())->resolve();
        });

        return response()->json([
            'success' => true,
            'data'    => $data,
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
