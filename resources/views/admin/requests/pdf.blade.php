<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Requisition and Issue Slip</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 12px;
            color: black;
            margin: 0;
            padding: 8px;
            line-height: 1.15;
        }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .font-semibold { font-weight: bold; }
        .underline { text-decoration: underline; }
        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 11px;
        }
        td, th {
            padding: 4px;
            vertical-align: middle;
            overflow-wrap: anywhere;
            word-break: break-word;
            white-space: nowrap;
        }
        .with-border td, .with-border th { border: 1px solid black; }
        .copy-divider { border-top: 2px dashed black; margin: 20px 0; }
        .wrap-text { overflow-wrap: anywhere; word-break: break-word; white-space: normal; }
        .fit-text {
            white-space: nowrap;
            overflow: visible;
            text-overflow: clip;
            font-size: 8px;
            line-height: 1.0;
        }
    </style>
</head>
<body>

@for($copy=0; $copy<2; $copy++)
    @if($copy > 0)
        <div class="copy-divider" style="margin-top:40px"></div>
    @endif

    <div style="text-align:right; font-size:10px; margin-top:10px; margin-bottom:8px;">Appendix 63</div>
    <div class="text-center font-bold" style="font-size:16px; margin:10px 0 30px 0;">
        REQUISITION AND ISSUE SLIP
    </div>

    @php
        $issuedBy = $ris->issuedBy;
        $requestedBy = $ris->requestedBy;
        $receivedBy = $ris->receivedBy;
        $issuedByOffice = $issuedBy?->office ?? '';
        $requestedByOffice = $requestedBy?->office ?? '';
        $issuedByName = $issuedBy ? trim($issuedBy->firstname.' '.$issuedBy->middlename.' '.$issuedBy->lastname) : '';
        $issuedByPosition = $issuedBy?->designation ?? '';
        $requestedByName = $requestedBy ? trim($requestedBy->firstname.' '.$requestedBy->middlename.' '.$requestedBy->lastname) : '';
        $requestedByPosition = $requestedBy?->designation ?? '';
        $receivedByName = $receivedBy ? trim($receivedBy->firstname.' '.$receivedBy->middlename.' '.$receivedBy->lastname) : '';
        $receivedByPosition = $receivedBy?->designation ?? '';
        $purpose = $ris->purpose ?? 'Purpose is not specified';
    @endphp
        {{-- Top Info --}}
    <table>
        <tr>
            <td colspan="4" class="font-semibold">
                Entity Name: <span class="underline">DIVISION OF THE CITY OF ILAGAN</span>
            </td>
            <td colspan="4" class="font-semibold">
                Fund Cluster: <span class="underline">______________________________________</span>
            </td>
        </tr>
    </table>

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
                Office: <span class="underline font-semibold">{{ $requestedByOffice }}</span>
            </td>
            <td colspan="4" style="border-top:none;border-bottom:none;">
                RIS No.: <span class="underline font-semibold">{{ $risNumber }}</span>
            </td>
        </tr>
        <tr class="with-border text-center font-semibold" style="font-size:14px;">
            <td colspan="4">Requisition</td>
            <td colspan="4">Issue</td>
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
                $isIssued = $quantityIssued > 0;
            @endphp
            <tr class="with-border text-center">
                <td></td>
                <td>{{ $unit }}</td>
                <td class="text-left wrap-text" style="padding-left:8px;">{{ $description }}</td>
                <td>{{ $quantityRequested }}</td>
                <td style="font-family: 'DejaVu Sans', Arial, sans-serif;">{{ $isIssued ? '✓' : '' }}</td>
                <td style="font-family: 'DejaVu Sans', Arial, sans-serif;">{{ $isIssued ? '' : '✓' }}</td>
                <td>{{ $quantityIssued }}</td>
                <td>{{ $remarks }}</td>
            </tr>
        @endforeach


        <tr class="with-border">
            <td colspan="8" class="wrap-text" style="font-size:14px;">
                Purpose: <span class="wrap-text" style="font-size:12px;">{{ $ris->request->purpose ?? '' }}</span>
            </td>
        </tr>
    </table>

    <table class="with-border" style="width:100%; font-size:11px; text-align:center; margin-top:0 !important;">
        <tr class="font-bold text-left">
            <td style="width:8%;border:solid black 1px; border-top:none; border-bottom:none;"></td>
            <td style="width:23%;border:solid black 1px; border-top:none; border-bottom:none;">Requested by:</td>
            <td style="width:23%;border:solid black 1px; border-top:none; border-bottom:none;">Approved by:</td>
            <td style="width:23%;border:solid black 1px; border-top:none; border-bottom:none;">Issued by:</td>
            <td style="width:23%;border:solid black 1px; border-top:none; border-bottom:none;">Received by:</td>
        </tr>
        <tr class="text-left">
            <td style="border-left:solid black 1px; border-top:none;"style="width:8%; font-size:8px;">Signature:</td>
            <td style="border:solid black 1px; height:25px; border-top:none;"></td>
            <td style="border:solid black 1px; border-top:none;"></td>
            <td style="border:solid black 1px; border-top:none;"></td>
            <td style="border:solid black 1px; border-top:none;"></td>
        </tr>
        <tr>
            <td class="text-left text-nowrap" style="width:8%; font-size:8px;">Printed Name :</td>
            <td class="font-bold fit-text" style="width:23%;">{{ $requestedByName }}</td>
            <td class="font-bold fit-text" style="width:23%;">ADELINE C. SORIANO</td>
            <td class="font-bold fit-text" style="width:23%;">{{ $issuedByName }}</td>
            <td class="font-bold fit-text" style="width:23%;">{{ $requestedByName }}</td>
        </tr>
        <tr>
            <td class="text-left"style="width:8%; font-size:8px;">Designation :</td>
            <td class="fit-text" style="width:23%;">{{ $requestedByPosition }}</td>
            <td class="fit-text" style="width:23%;">SUPPLY OFFICER</td>
            <td class="fit-text" style="width:23%;">{{ $issuedByPosition }}</td>
            <td class="fit-text" style="width:23%;">{{ $requestedByPosition }}</td>
        </tr>
        <tr>
            <td class="text-left" style="width:8%; font-size:8px;">Date :</td>
            <td>{{ optional($ris->issue_date)->format('Y-m-d') ?? '' }}</td>
            <td>{{ optional($ris->issue_date)->format('Y-m-d') ?? '' }}</td>
            <td>{{ optional($ris->issue_date)->format('Y-m-d') ?? '' }}</td>
            <td>{{ optional($ris->issue_date)->format('Y-m-d') ?? '' }}</td>
        </tr>
    </table>

@endfor

</body>
</html>