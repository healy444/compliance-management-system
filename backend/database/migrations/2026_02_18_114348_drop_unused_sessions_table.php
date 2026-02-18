<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('model_has_permissions');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Not easily reversible as data is lost, but usually we would recreate the schema if needed.
        // For cleanup, leaving empty is often acceptable or we could restore standard Laravel schemas.
    }
};
