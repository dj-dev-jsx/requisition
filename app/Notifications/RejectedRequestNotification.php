<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;
use App\Models\Requests as UserRequest;

class RejectedRequestNotification extends Notification
{
    use Queueable;

    protected $request;

    public function __construct(UserRequest $request)
    {
        $this->request = $request;
    }

    public function via($notifiable)
    {
        return ['database']; // stores in notifications table
    }

    public function toDatabase($notifiable)
    {
        return [
            'request_id' => $this->request->id,
            'request_number' => $this->request->request_number,
            'user_name' => $this->request->user->firstname . ' ' . $this->request->user->lastname,
            'status' => $this->request->status, // 'rejected'
            'rejection_reason' => $this->request->rejection_reason,
            'message' => 'Your request has been rejected',
        ];
    }
}