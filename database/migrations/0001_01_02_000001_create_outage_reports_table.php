<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outage_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('lgu_id')->constrained('lgus')->onDelete('cascade');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->text('description')->nullable();
            $table->string('photo_path')->nullable();
            $table->enum('outage_type', ['transformer', 'distribution_line', 'transmission_line', 'brownout', 'rotational_blackout', 'other'])->default('other');
            $table->enum('status', ['pending', 'verified', 'resolved'])->default('pending');
            $table->unsignedTinyInteger('ai_severity_score')->default(0);
            $table->json('ai_metadata')->nullable();
            $table->text('dispatch_notes')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['lgu_id', 'status']);
            $table->index(['lgu_id', 'created_at']);
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outage_reports');
    }
};
