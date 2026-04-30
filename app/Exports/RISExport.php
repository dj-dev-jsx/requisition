<?php

namespace App\Exports;

use App\Models\PAR;
use App\Models\RIS;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class RISExport implements FromCollection, WithHeadings, WithEvents, WithMapping, WithStyles
{
    protected $month;
    protected $year;
    protected $lastRisNo = null; // used to hide repeated RIS numbers in map()

    public function __construct($month = null, $year = null)
    {
        $this->month = $month;
        $this->year = $year;
    }

    /**
     * Return a COLLECTION where each element corresponds to ONE output ROW.
     * We flatten RIS -> items so we have one row per item, with the parent RIS attached.
     */
    public function collection()
    {
        $query = RIS::with([
            'request.items.item',
            'request.user',
        ]);

        if ($this->month) {
            $query->whereMonth('created_at', $this->month);
        }
        if ($this->year) {
            $query->whereYear('created_at', $this->year);
        }

        $risList = $query->orderBy('ris_number')->get();
        $rows = collect();

        foreach ($risList as $ris) {
        if ($ris->request->items->isEmpty()) {
            $rows->push((object)[
                'ris' => $ris,
                'item' => null,
            ]);
        } else {
            foreach ($ris->request->items as $reqItem) {
                $rows->push((object)[
                    'ris' => $ris,
                    'item' => $reqItem,
                ]);
            }
        }
    }


        return $rows;
    }

    public function headings(): array
    {
        if ($this->month && $this->year) {
            $monthName = date("F", mktime(0, 0, 0, (int)$this->month, 1));
            $daysInMonth = date("t", strtotime("{$this->year}-{$this->month}-01"));
            $dateRange = "{$monthName} 1–{$daysInMonth}, {$this->year}";
        } elseif ($this->year) {
            $dateRange = "January 1–December 31, {$this->year}";
        } else {
            $dateRange = ""; // ❗ no fallback to current date
        }

        return [
            ['Appendix 64'], 
            ['REPORT OF SUPPLIES AND MATERIALS ISSUED'], 
            ['Entity Name: SDO City of Ilagan', '', '', '', '', '', ''],
            ['Fund Cluster: 01', '', '', '', '', '', '', "Date: {$dateRange}"],
            ['To be filled up by the Supply and/or Property Division/Unit', '', '', '', '', 'To be filled up by the Accounting Division/Unit'],
            [
                'RIS No.',
                'Responsibility Center Code',
                'Stock No.',
                'Item',
                'Unit',
                'Quantity Issued',
                'Unit Cost',
                'Amount'
            ],
        ];
    }

    /**
     * Map each flattened row (stdClass with ris + item) to the final array
     */
public function map($row): array
{
    $ris = $row->ris;
    $reqItem = $row->item;
    $item = $reqItem?->item;

    $quantity = $reqItem?->issued_quantity ?? 0;

    

    // ✅ show RIS only once
    $showRis = $this->lastRisNo !== $ris->ris_number;
    if ($showRis) {
        $this->lastRisNo = $ris->ris_number;
    }

    return [
        $showRis ? $ris->ris_number : '',
        '', // Responsibility Center Code
        '', // Stock No
        $item->description, // ✅ Description from item_desc
        $item->unit,
        $quantity,
        '',
        '',
         ($showRis ? ($ris->request->user->office ?? '') : ''),
    ];
}

    /**
     * Styling, merging and totals after sheet is filled
     */
    public function registerEvents(): array
    {
        return [
            // inside registerEvents()
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // default font
                $sheet->getParent()->getDefaultStyle()->applyFromArray([
                    'font' => ['name' => 'Times New Roman', 'size' => 10],
                ]);

                // merge header ranges
                $sheet->mergeCells('A1:H1');
                $sheet->mergeCells('A2:H2');
                $sheet->mergeCells('A3:F3');
                $sheet->mergeCells('A4:F4');
                $sheet->mergeCells('A5:E5');
                $sheet->mergeCells('F5:H5');

                // titles
                $sheet->getStyle('A1:H1')->applyFromArray([
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
                    'font'      => ['name' => 'Times New Roman', 'size' => 12, 'bold' => true],
                ]);
                $sheet->getStyle('A2:H2')->applyFromArray([
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                    'font'      => ['name' => 'Times New Roman', 'size' => 12, 'bold' => true],
                ]);
                $sheet->getStyle('A3:H4')->applyFromArray([
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
                    'font'      => ['name' => 'Times New Roman', 'size' => 10],
                ]);
                $sheet->getStyle('A5:H5')->applyFromArray([
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                    'font'      => ['name' => 'Times New Roman', 'size' => 10, 'italic' => true],
                ]);

                // header row style (row 6)
                $highestColumn = $sheet->getHighestColumn();
                $sheet->getStyle("A6:{$highestColumn}6")->applyFromArray([
                    'font' => ['name' => 'Times New Roman', 'size' => 10, 'bold' => true],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                // determine data bounds
                $startDataRow = 7; // headers occupy rows 1..6
                $highestRow = $sheet->getHighestRow();

                if ($highestRow < $startDataRow) {
                    foreach (range('A', $highestColumn) as $col) {
                        $sheet->getColumnDimension($col)->setAutoSize(true);
                    }
                    return;
                }

                // number format for cost columns
                $sheet->getStyle("G{$startDataRow}:G{$highestRow}")
                    ->getNumberFormat()->setFormatCode('#,##0.00');
                $sheet->getStyle("H{$startDataRow}:H{$highestRow}")
                    ->getNumberFormat()->setFormatCode('#,##0.00');

                // Borders: thin inside, medium outline (only until last data row, no totals)
                $sheet->getStyle("A6:{$highestColumn}{$highestRow}")
                    ->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
                $sheet->getStyle("A6:{$highestColumn}{$highestRow}")
                    ->getBorders()->getOutline()->setBorderStyle(Border::BORDER_MEDIUM);

                // autosize columns
                foreach (range('A', $highestColumn) as $col) {
                    $sheet->getColumnDimension($col)->setAutoSize(true);
                }
            }

        ];
    }

    public function styles(Worksheet $sheet)
    {
        // additional style hooks if needed
        $sheet->getStyle('A1:A2')->getFont()->setBold(true)->setSize(12);
        $sheet->getStyle('A1:A2')->getAlignment()->setHorizontal('center');
        $sheet->getStyle('A6:H6')->getFont()->setBold(true); // table headers

        return [];
    }
}
