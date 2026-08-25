<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_analyses', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['risk_assessment', 'permit_analysis'])->default('risk_assessment');
            $table->string('region')->nullable();
            $table->string('province')->nullable();
            $table->json('data');
            $table->timestamp('created_at');

            $table->index(['type', 'created_at']);
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('message');
            $table->enum('type', ['push', 'email', 'in_app'])->default('in_app');
            $table->string('category', 20)->default('updates');
            $table->string('link')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('created_at');

            $table->index(['user_id', 'read_at']);
        });

        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('lgu_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('body');
            $table->enum('severity', ['info', 'warning', 'critical'])->default('info');
            $table->timestamps();

            $table->index('created_at');
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('action');
            $table->string('entity_type');
            $table->unsignedBigInteger('entity_id');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at');

            $table->index(['entity_type', 'entity_id']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('ai_analyses');
    }
};
