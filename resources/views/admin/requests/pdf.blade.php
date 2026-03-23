<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Requisition and Issue Slip</title>
    <style>
        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 12px;
            color: black;
            padding: 10px;
        }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .font-semibold { font-weight: bold; }
        .underline { text-decoration: underline; }
        table { width: 100%; border-collapse: collapse; font-size: 11px;}
        td, th { padding: 4px; vertical-align: middle; }
        .with-border td, .with-border th { border: 1px solid black; }
        .copy-divider { border-top: 2px dashed black; margin: 20px 0; }
    </style>
</head>
<body>

@for($copy=0; $copy<2; $copy++)

    <div class="text-center font-bold" style="font-size:16px; margin:30px 0;">
        Requisition and Issue Slip
    </div>

    @php
        $issuedByName = $ris->issuedBy ? trim($ris->issuedBy->firstname.' '.$ris->issuedBy->middlename.' '.$ris->issuedBy->lastname) : '';
        $issuedByPosition = $ris->issuedBy->office ?? '';
        $requestedByName = $ris->requestedBy ? trim($ris->requestedBy->firstname.' '.$ris->requestedBy->middlename.' '.$ris->requestedBy->lastname) : '';
        $requestedByPosition = $ris->requestedBy->office ?? '';
        $receivedByName = $ris->receivedBy ? trim($ris->receivedBy->firstname.' '.$ris->receivedBy->middlename.' '.$ris->receivedBy->lastname) : '';
        $receivedByPosition = $ris->receivedBy->office ?? '';
        $purpose = $ris->purpose ?? 'Purpose is not specified';
    @endphp

    <table>
        <tr class="with-border">
            <td colspan="4" style="border-bottom:none;">
                Division: <span class="underline font-semibold"></span>
            </td>
            <td colspan="4" style="border-bottom:none;">
                Responsibility Center Code: <span class="underline font-semibold"></span>
            </td>
        </tr>
        <tr class="with-border">
            <td colspan="4" style="border-top:none;border-bottom:none;">
                Office: <span class="underline font-semibold">{{ $requestedByPosition }}</span>
            </td>
            <td colspan="4" style="border-top:none;border-bottom:none;">
                RIS No.: <span class="underline font-semibold"></span>
            </td>
        </tr>
        <tr class="with-border text-center font-semibold" style="font-size:14px;">
            <td colspan="4">Requisition</td>
            <td colspan="4">Issuance</td>
        </tr>
        <tr class="with-border text-center font-bold">
            <td style="width:8%;">Stock No.</td>
            <td style="width:10%;">Unit</td>
            <td style="width:32%;">Description</td>
            <td style="width:10%;">Quantity</td>
            <td style="width:6%;">Yes</td>
            <td style="width:6%;">No</td>
            <td style="width:10%;">Quantity</td>
            <td style="width:18%;">Remarks</td>
        </tr>

        @foreach($ris->request->items as $issued)
            @php
                $inventoryItem = $issued->item;
                $unit = $inventoryItem->unit ?? '';
                $description = $inventoryItem->description ?? '';
                $quantityRequested = intval($issued->quantity ?? 0);
                $quantityIssued = intval($issued->issued_quantity ?? 0);
                $remarks = $issued->remarks ?? '';
            @endphp
            <tr class="with-border text-center">
                <td></td>
                <td>{{ $unit }}</td>
                <td class="text-left" style="padding-left:8px;">{{ $description }}</td>
                <td>{{ $quantityIssued }}</td>
                <td></td>
                <td></td>
                <td>{{ $quantityIssued }}</td>
                <td>{{ $remarks }}</td>
            </tr>
        @endforeach


        <tr class="with-border">
            <td colspan="8" style="font-size:14px;">
                Purpose: <span style="font-size:12px;"></span>
            </td>
        </tr>
    </table>

    <table class="with-border" style="width:100%; font-size:11px; text-align:center; margin-top:0 !important;">
        <tr class="font-bold text-left">
            <td style="width:13%;border:solid black 1px; border-top:none; border-bottom:none;"></td>
            <td style="width:19%;border:solid black 1px; border-top:none; border-bottom:none;">Requested by:</td>
            <td style="width:22%;border:solid black 1px; border-top:none; border-bottom:none;">Approved by:</td>
            <td style="width:23%;border:solid black 1px; border-top:none; border-bottom:none;">Issued by:</td>
            <td style="width:23%;border:solid black 1px; border-top:none; border-bottom:none;">Received by:</td>
        </tr>
        <tr class="text-left">
            <td style="border-left:solid black 1px; border-top:none;">Signature:</td>
            <td style="border:solid black 1px; height:25px; border-top:none;"></td>
            <td style="border:solid black 1px; border-top:none;"></td>
            <td style="border:solid black 1px; border-top:none;"></td>
            <td style="border:solid black 1px; border-top:none;"></td>
        </tr>
        <tr>
            <td class="text-left text-nowrap">Printed Name :</td>
            <td class="font-bold">{{ $requestedByName }}</td>
            <td class="font-bold">Adeline C. Soriano</td>
            <td class="font-bold">{{ $issuedByName }}</td>
            <td class="font-bold">{{ $requestedByName }}</td>
        </tr>
        <tr>
            <td class="text-left">Designation :</td>
            <td></td>
            <td>Supply Officer</td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td class="text-left">Date :</td>
            <td>{{ optional($ris->created_at)->format('Y-m-d') ?? '' }}</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    </table>

    @if($copy === 0)
        <div class="copy-divider" style="margin-top:40px"></div>
    @endif

@endfor

</body>
</html>