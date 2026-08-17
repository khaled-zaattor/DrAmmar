<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();

            // Display values only — refreshed from the most recent booking.
            // Matching is done against customer_contacts, which keeps every
            // address and number the customer has ever booked with.
            $table->string('name');
            $table->string('email');
            $table->string('phone', 20);

            $table->timestamp('first_booked_at')->nullable();
            $table->timestamp('last_booked_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
