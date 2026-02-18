<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agencies', function (Blueprint $table) {
            if (!Schema::hasColumn('agencies', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('name');
            }
        });

        Schema::table('branch_unit_departments', function (Blueprint $table) {
            if (!Schema::hasColumn('branch_unit_departments', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('name');
            }
        });

        Schema::table('positions', function (Blueprint $table) {
            if (!Schema::hasColumn('positions', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('agencies', function (Blueprint $table) {
            if (Schema::hasColumn('agencies', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });

        Schema::table('branch_unit_departments', function (Blueprint $table) {
            if (Schema::hasColumn('branch_unit_departments', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });

        Schema::table('positions', function (Blueprint $table) {
            if (Schema::hasColumn('positions', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });
    }
};
