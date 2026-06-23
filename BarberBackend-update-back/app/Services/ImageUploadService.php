<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImageUploadService
{
    public function upload(UploadedFile $file, string $folder): string
    {
        return $file->store($folder, 'public');
    }

    public function delete(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    public function replace(?string $oldPath, ?UploadedFile $newFile, string $folder): ?string
    {
        if ($newFile) {
            $this->delete($oldPath);
            return $this->upload($newFile, $folder);
        }

        return $oldPath;
    }
}
