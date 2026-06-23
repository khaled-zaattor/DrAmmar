<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('booking_reference', 20)->unique();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone', 20);
            $table->foreignId('barber_id')->constrained()->restrictOnDelete();
            $table->foreignId('service_id')->constrained()->restrictOnDelete();
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->unsignedSmallInteger('duration_minutes');
            $table->decimal('total_price', 8, 2);
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])
                  ->default('pending');
            $table->text('notes')->nullable();
            $table->timestamp('checked_in_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            // Prevent double booking — database-level constraint
            $table->unique(['barber_id', 'appointment_date', 'appointment_time']);

            $table->index(['appointment_date', 'status']);
            $table->index('customer_email');
            $table->index('booking_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
