<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceCategoryResource;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * GET /api/categories
     * List all active categories with services count.
     */
    public function index(): JsonResponse
    {
        $categories = ServiceCategory::active()
            ->ordered()
            ->withCount('services')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => ServiceCategoryResource::collection($categories),
        ]);
    }

    /**
     * GET /api/categories/{category}
     * Single category with its active services.
     */
    public function show(ServiceCategory $category): JsonResponse
    {
        if (!$category->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found.',
            ], 404);
        }

        $category->load(['services' => fn ($q) => $q->active()->with('category:id,name')]);

        return response()->json([
            'success' => true,
            'data'    => new ServiceCategoryResource($category),
        ]);
    }
}
