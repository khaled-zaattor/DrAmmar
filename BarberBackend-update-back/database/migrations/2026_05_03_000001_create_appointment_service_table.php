<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_service', function (Blueprint $table) {
            $table->foreignId('appointment_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->foreignId('service_id')
                  ->constrained()
                  ->restrictOnDelete();
            $table->decimal('price_snapshot', 8, 2);
            $table->unsignedSmallInteger('duration_snapshot');
            $table->primary(['appointment_id', 'service_id']);
            $table->index('service_id');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('service_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('service_id')->nullable(false)->change();
        });

        Schema::dropIfExists('appointment_service');
    }
};
