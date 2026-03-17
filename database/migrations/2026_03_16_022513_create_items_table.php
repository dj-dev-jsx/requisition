<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string("description")->nullable();
            $table->foreignId('category_id')->nullable()->constrained('categories')->restrictOnDelete();
            $table->decimal("stock_quantity", 8, 2);
            $table->string("unit", 50)->nullable();
            $table->enum("status", ["in_stock", "out_of_stock", "low_stock"])->nullable();
            $table->string("image")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
