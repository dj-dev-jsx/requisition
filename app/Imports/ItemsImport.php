<?php
namespace App\Imports;

use App\Models\Items;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class ItemsImport implements ToCollection
{
    public function collection(Collection $rows)
    {
        foreach ($rows->skip(1) as $row) {
            $stock = (int) $row[1];

            Items::create([
                'description' => $row[0],
                'stock_quantity' => $stock,
                'unit' => $row[2],
                'status' => $this->getStatus($stock),
            ]);
        }
    }

    private function getStatus($stock)
    {
        if ($stock <= 0) return 'out_of_stock';
        if ($stock <= 10) return 'low_stock';
        return 'in_stock';
    }
}
