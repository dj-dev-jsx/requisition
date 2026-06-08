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
            'firstname' => 'Mark Joseph',
            'lastname' => 'Limon',
            'middlename' => 'M',
            'email' => 'admin@gmail.com',
            'username'=> 'admin',
            'office' => 'Supply Office',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
        ]);
        $admin->assignRole($adminRole);

        // Requesters (with division_id)
        $requesters = [
            [
                'firstname' => 'Mark Joseph',
                'lastname' => 'Limon',
                'middlename' => 'M.',
                'username' => 'emjay',
                'office' => 'Supply Office',
                'email' => 'mark.joseph.limon@gmail.com',
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
