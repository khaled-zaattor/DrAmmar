<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use App\Services\ImageUploadService;
use Illuminate\Http\JsonResponse;

class ServiceController extends Controller
{
    public function __construct(
        private readonly ImageUploadService $imageService
    ) {}

    public function index(): JsonResponse
    {
        $sort    = request('sort', 'name');
        $dir     = request('dir', 'asc') === 'desc' ? 'desc' : 'asc';
        $allowed = ['name', 'booking_count', 'price', 'duration_minutes'];
        if (!in_array($sort, $allowed)) $sort = 'name';

        $query = Service::with('category:id,name')->orderBy($sort, $dir);

        if (request()->filled('category_id')) {
            $query->where('category_id', request('category_id'));
        }

        $services = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data'    => ServiceResource::collection($services)->response()->getData(true),
        ]);
    }

    public function store(StoreServiceRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $this->imageService->upload($request->file('image'), 'services');
        }

        $service = Service::create($data);
        $service->load('category:id,name');

        return response()->json([
            'success' => true,
            'message' => 'Service created successfully.',
            'data'    => new ServiceResource($service),
        ], 201);
    }

    public function update(UpdateServiceRequest $request, Service $service): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $this->imageService->replace($service->image, $request->file('image'), 'services');
        }

        $service->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Service updated successfully.',
            'data'    => new ServiceResource($service->fresh()),
        ]);
    }

    public function destroy(Service $service): JsonResponse
    {
        $this->imageService->delete($service->image);
        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service deleted successfully.',
        ]);
    }

    /**
     * PATCH /api/admin/services/{service}/toggle
     */
    public function toggle(Service $service): JsonResponse
    {
        $service->update(['is_active' => !$service->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Service ' . ($service->is_active ? 'activated' : 'deactivated') . '.',
            'data'    => new ServiceResource($service->fresh()->load('category:id,name')),
        ]);
    }
}
