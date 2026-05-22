<?php
require_once 'config.php';
session_start();

if (isset($_GET['reference'])) {
    $reference = $_GET['reference'];
    
    // Verify payment with Paystack
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => "https://api.paystack.co/transaction/verify/" . rawurlencode($reference),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "accept: application/json",
            "authorization: Bearer " . PAYSTACK_SECRET_KEY,
            "cache-control: no-cache"
        ],
    ));
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    
    if ($err) {
        die('Curl returned error: ' . $err);
    }
    
    $tranx = json_decode($response);
    
    if (!$tranx->status) {
        die('API returned error: ' . $tranx->message);
    }
    
    if ('success' == $tranx->data->status) {
        // Payment was successful
        $amount = $tranx->data->amount / 100; // Convert back to Naira
        
        // Update ticket status in database
        $stmt = $pdo->prepare("UPDATE tickets SET status = 'paid' WHERE reference = ?");
        $stmt->execute([$reference]);
        
        // Generate QR code
        $ticket = getTicketByReference($reference);
        $qrFilename = 'TEDX_' . $reference . '.png';
        $qrData = SITE_URL . '/admin/view_ticket.php?reference=' . $reference;
        $qrPath = generateQRCode($qrData, $qrFilename);
        
        // Update ticket with QR code path
        $stmt = $pdo->prepare("UPDATE tickets SET qr_code = ? WHERE reference = ?");
        $stmt->execute([$qrFilename, $reference]);
        
        // Redirect to ticket page
        header('Location: ticket.php?reference=' . $reference);
        exit();
    } else {
        // Payment failed
        header('Location: index.php?payment=failed');
        exit();
    }
} else {
    header('Location: index.php');
    exit();
}
?>