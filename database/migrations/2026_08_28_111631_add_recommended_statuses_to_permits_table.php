<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('permits', function (Blueprint $table) {
            $table->string('status', 30)->default('submitted')->change();
        });

        Schema::table('permit_status_histories', function (Blueprint $table) {
            $table->string('old_status', 30)->nullable()->change();
            $table->string('new_status', 30)->change();
        });
    }

    public function down(): void
    {
        Schema::table('permits', function (Blueprint $table) {
            $table->enum('status', ['submitted', 'in_review', 'approved', 'rejected'])->default('submitted')->change();
        });

        Schema::table('permit_status_histories', function (Blueprint $table) {
            $table->enum('old_status', ['submitted', 'in_review', 'approved', 'rejected'])->nullable()->change();
            $table->enum('new_status', ['submitted', 'in_review', 'approved', 'rejected'])->change();
        });
    }
};
