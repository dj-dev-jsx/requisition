<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestItems extends Model
{
    protected $table = 'request_items';
    protected $fillable = [
        'request_id',
        'item_id',
        'quantity',
        'issued_quantity',
    ];

    public function request()
    {
        return $this->belongsTo(Requests::class, 'request_id'); // correct
    }

    public function item()
    {
        return $this->belongsTo(Items::class, 'item_id');
    }
        public function ris() {
        return $this->hasOne(Ris::class, 'request_id');
    }
}
