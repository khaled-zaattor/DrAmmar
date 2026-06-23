<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('business_hours', function (Blueprint $table) {
            $table->unsignedSmallInteger('slot_duration')
                ->default(30)
                ->after('is_closed')
                ->comment('Minutes between booking slots');
        });
    }

    public function down(): void
    {
        Schema::table('business_hours', function (Blueprint $table) {
            $table->dropColumn('slot_duration');
        });
    }
};
