<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Requests extends Model
{
    protected $table = 'requests';
    protected $fillable = [
        'request_number',
        'user_id',
        'status',
        'purpose',
        'processed_by',
        'approved_at',
    ];

    public function items()
    {
        return $this->hasMany(RequestItems::class, 'request_id'); // correct
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function ris()
{
    return $this->hasOne(RIS::class, 'request_id', 'id');
}

}