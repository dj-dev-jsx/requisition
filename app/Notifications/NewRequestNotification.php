<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;
use App\Models\Requests as UserRequest;

class NewRequestNotification extends Notification
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
            'message' => "New request from {$this->request->user->name}",
            'request_id' => $this->request->id, // <-- add request ID
        ];
    }
}