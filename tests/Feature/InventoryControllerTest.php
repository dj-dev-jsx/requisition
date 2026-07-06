<?php

namespace Tests\Feature;

use App\Http\Controllers\Admin\InventoryController;
use App\Models\Items;
use App\Models\RequestItems;
use App\Models\Requests;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class InventoryControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_allows_partial_issue_when_only_selected_items_have_quantities(): void
    {
        $admin = User::create([
            'firstname' => 'Admin',
            'lastname' => 'User',
            'email' => 'admin@example.com',
            'username' => 'admin',
            'password' => Hash::make('password'),
        ]);

        $requester = User::create([
            'firstname' => 'Request',
            'lastname' => 'User',
            'email' => 'requester@example.com',
            'username' => 'requester',
            'password' => Hash::make('password'),
        ]);

        $availableItem = Items::create([
            'description' => 'Pens',
            'stock_quantity' => 10,
            'unit' => 'pcs',
            'status' => 'in_stock',
        ]);

        $outOfStockItem = Items::create([
            'description' => 'Paper',
            'stock_quantity' => 0,
            'unit' => 'pcs',
            'status' => 'out_of_stock',
        ]);

        $request = Requests::create([
            'user_id' => $requester->id,
            'status' => 'pending',
            'purpose' => 'Office supplies',
        ]);

        $availableRequestItem = RequestItems::create([
            'request_id' => $request->id,
            'item_id' => $availableItem->id,
            'quantity' => 3,
        ]);

        $outOfStockRequestItem = RequestItems::create([
            'request_id' => $request->id,
            'item_id' => $outOfStockItem->id,
            'quantity' => 2,
        ]);

        $this->actingAs($admin);

        $response = (new InventoryController())->approve(
            new HttpRequest([
                'items' => [
                    (string) $availableRequestItem->id => 1,
                    (string) $outOfStockRequestItem->id => 0,
                ],
                'issue_date' => now()->toDateString(),
            ]),
            $request
        );

        $this->assertSame(200, $response->getStatusCode());

        $availableRequestItem->refresh();
        $outOfStockRequestItem->refresh();
        $availableItem->refresh();
        $outOfStockItem->refresh();

        $this->assertSame(1, $availableRequestItem->issued_quantity);
        $this->assertSame(0, $outOfStockRequestItem->issued_quantity);
        $this->assertSame(9, $availableItem->stock_quantity);
        $this->assertSame('out_of_stock', $outOfStockItem->status);
        $this->assertSame('processed', $request->fresh()->status);
    }
}
