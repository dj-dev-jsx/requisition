<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Items extends Model
{
    protected $fillable = [
        'description',
        'stock_quantity',
        'unit',
        'status',
        'image', // optional if you want to store image path
    ];
}
