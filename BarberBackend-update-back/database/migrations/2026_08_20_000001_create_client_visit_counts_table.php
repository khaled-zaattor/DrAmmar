<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_visit_counts', function (Blueprint $table) {
            $table->id();
            $table->enum('identifier_type', ['phone', 'email']);
            $table->string('normalized_identifier');
            $table->unsignedInteger('visit_count')->default(0);
            $table->timestamp('last_calculated_at')->nullable();
            $table->timestamps();

            $table->unique(['identifier_type', 'normalized_identifier'], 'client_visit_counts_identifier_unique');
        });

        Schema::create('counted_appointment_visits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('source_appointment_id');
            $table->foreignId('client_visit_count_id')
                ->constrained('client_visit_counts')
                ->cascadeOnDelete();
            $table->enum('identifier_type', ['phone', 'email']);
            $table->string('normalized_identifier');
            $table->timestamp('counted_at');
            $table->timestamps();

            $table->unique(['source_appointment_id', 'identifier_type'], 'counted_appointment_visits_source_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('counted_appointment_visits');
        Schema::dropIfExists('client_visit_counts');
    }
};
