<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('lgu_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('agency_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('permit_type', ['solar_rooftop', 'transmission_line', 'generator_set', 'battery_storage', 'wind_turbine', 'other'])->default('other');
            $table->text('description');
            $table->json('documents')->nullable();
            $table->enum('status', ['submitted', 'in_review', 'approved', 'rejected'])->default('submitted');
            $table->unsignedTinyInteger('ai_compliance_score')->default(0);
            $table->json('ai_metadata')->nullable();
            $table->timestamp('submitted_at');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('decision_note')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('applicant_id');
            $table->index('lgu_id');
            $table->index('agency_id');
            $table->index('status');
            $table->index('created_at');
        });

        Schema::create('permit_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('permit_id')->constrained()->onDelete('cascade');
            $table->enum('old_status', ['submitted', 'in_review', 'approved', 'rejected'])->nullable();
            $table->enum('new_status', ['submitted', 'in_review', 'approved', 'rejected']);
            $table->foreignId('user_id')->constrained()->onDelete('restrict');
            $table->text('note')->nullable();
            $table->timestamp('created_at');

            $table->index(['permit_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permit_status_histories');
        Schema::dropIfExists('permits');
    }
};
