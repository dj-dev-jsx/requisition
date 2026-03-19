<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RIS extends Model
{
    protected $table = 'ris';
    protected $fillable = [
        'ris_number',
        'request_id',
        'issued_by',
        'requested_by',
        'received_by',
    ];

// Ris.php
public function issuedBy() {
    return $this->belongsTo(User::class, 'issued_by');
}

public function requestedBy() {
    return $this->belongsTo(User::class, 'requested_by');
}

public function receivedBy() {
    return $this->belongsTo(User::class, 'received_by');
}

public function request()
{
    return $this->belongsTo(Requests::class, 'request_id', 'id');

}

}
