<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auto_detected_outages', function (Blueprint $table) {
            $table->id();
            $table->string('source'); // twitter, facebook, news, web_search
            $table->string('source_url')->nullable();
            $table->string('source_author')->nullable();
            $table->text('raw_text'); // original post text
            $table->string('detected_province');
            $table->string('detected_region')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->foreignId('lgu_id')->nullable()->constrained('lgus')->nullOnDelete();
            $table->unsignedTinyInteger('confidence_score')->default(0); // 0-100 AI confidence
            $table->json('ai_analysis')->nullable(); // AI-extracted details
            $table->enum('status', ['detected', 'confirmed', 'dismissed'])->default('detected');
            $table->string('outage_type')->nullable(); // transformer, brownout, etc.
            $table->text('summary')->nullable(); // AI-generated summary
            $table->timestamp('detected_at'); // when the post was made
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'detected_at']);
            $table->index(['detected_province', 'status']);
            $table->index('source');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auto_detected_outages');
    }
};
