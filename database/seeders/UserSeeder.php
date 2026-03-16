<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $requesterRole = Role::firstOrCreate(['name' => 'user']);

        // Admin
        $admin = User::create([
            'firstname' => 'System',
            'lastname' => 'Administrator',
            'middlename' => '',
            'email' => 'admin@gmail.com',
            'username'=> 'admin',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
        ]);
        $admin->assignRole($adminRole);

        // Requesters (with division_id)
        $requesters = [
            [
                'firstname' => 'Juan',
                'lastname' => 'Dela Cruz',
                'middlename' => 'M.',
                'email' => 'juan.delacruz@email.com',
            ],
            [
                'firstname' => 'Ana',
                'lastname' => 'Reyes',
                'middlename' => 'S.',
                'email' => 'ana.reyes@email.com',
            ],
            [
                'firstname' => 'Carlos',
                'lastname' => 'Tan',
                'middlename' => 'G.',
                'email' => 'carlos.tan@email.com',
            ],
        ];

        foreach ($requesters as $data) {
            $user = User::create(array_merge($data, [
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
            ]));
            $user->assignRole($requesterRole);
        }
    }
}
