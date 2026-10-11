<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->boolean('is_addon')->default(false);
        });

        // Preserve services previously configured directly with no reserved time.
        DB::table('services')->where('duration_minutes', 0)->update(['is_addon' => true]);

        Schema::table('appointments', function (Blueprint $table) {
            // Retain the lookup/FK index while allowing add-ons to share a start time.
            $table->index(['barber_id', 'appointment_date', 'appointment_time'], 'appointments_barber_date_time_index');
        });
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropUnique(['barber_id', 'appointment_date', 'appointment_time']);
        });
    }

    public function down(): void
    {
        // Restoring this constraint will fail safely if shared start times now exist.
        Schema::table('appointments', function (Blueprint $table) {
            $table->unique(['barber_id', 'appointment_date', 'appointment_time']);
        });
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex('appointments_barber_date_time_index');
        });
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('is_addon');
        });
    }
};
