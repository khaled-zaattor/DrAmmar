<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceCategoryRequest;
use App\Http\Requests\UpdateServiceCategoryRequest;
use App\Http\Resources\ServiceCategoryResource;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * GET /api/admin/categories
     * List all categories (active + inactive) with services count.
     */
    public function index(): JsonResponse
    {
        $sort    = request('sort', 'sort_order');
        $dir     = request('dir', 'asc') === 'desc' ? 'desc' : 'asc';
        $allowed = ['name', 'sort_order', 'is_active', 'created_at'];
        if (!in_array($sort, $allowed)) $sort = 'sort_order';

        $categories = ServiceCategory::withCount('services')
            ->orderBy($sort, $dir)
            ->orderBy('name')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data'    => ServiceCategoryResource::collection($categories)->response()->getData(true),
        ]);
    }

    /**
     * POST /api/admin/categories
     */
    public function store(StoreServiceCategoryRequest $request): JsonResponse
    {
        $category = ServiceCategory::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully.',
            'data'    => new ServiceCategoryResource($category),
        ], 201);
    }

    /**
     * PUT /api/admin/categories/{category}
     */
    public function update(UpdateServiceCategoryRequest $request, ServiceCategory $category): JsonResponse
    {
        $category->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data'    => new ServiceCategoryResource($category->fresh()),
        ]);
    }

    /**
     * DELETE /api/admin/categories/{category}
     * Blocked if any services are linked to this category.
     */
    public function destroy(ServiceCategory $category): JsonResponse
    {
        $count = $category->services()->count();

        if ($count > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete: {$count} service(s) are linked to this category. Reassign or delete them first.",
            ], 422);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.',
        ]);
    }

    /**
     * PATCH /api/admin/categories/{category}/toggle
     * Toggle the is_active flag.
     */
    public function toggle(ServiceCategory $category): JsonResponse
    {
        $category->update(['is_active' => !$category->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Category ' . ($category->is_active ? 'activated' : 'deactivated') . '.',
            'data'    => new ServiceCategoryResource($category->fresh()),
        ]);
    }
}
