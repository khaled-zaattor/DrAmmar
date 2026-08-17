<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();

            $table->enum('kind', ['email', 'phone']);

            // Normalised by App\Support\ContactKey — lowercased email, or
            // digits-only phone.
            $table->string('value');

            // One customer per contact detail. If a booking arrives carrying
            // one person's email and another's phone, CustomerResolver merges
            // the two customers rather than letting a duplicate key exist.
            $table->unique(['kind', 'value']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_contacts');
    }
};
