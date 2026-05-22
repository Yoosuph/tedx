<?php
session_start();
require_once '../config.php';

if (!isAdminLoggedIn()) {
    header('Location: index.php');
    exit();
}

$message = '';
$messageType = 'info';
$ticket = null;

if (isset($_GET['reference'])) {
    $reference = $_GET['reference'];
    $ticket = getTicketByReference($reference);
    
    if (!$ticket) {
        $message = "Ticket not found with reference: $reference";
        $messageType = "error";
    }
} elseif (isset($_POST['qr_data'])) {
    // Handle QR code scan
    $qrData = trim($_POST['qr_data']);
    $ticket = getTicketByQRData($qrData);
    
    if (!$ticket) {
        $message = "Ticket not found for scanned QR code";
        $messageType = "error";
    }
}

if ($ticket && isset($_GET['action']) && $_GET['action'] == 'mark_used' && $ticket['status'] == 'paid') {
    if (markTicketAsUsed($ticket['reference'])) {
        $message = "Ticket marked as used successfully";
        $messageType = "success";
        // Refresh ticket data
        $ticket = getTicketByReference($ticket['reference']);
    } else {
        $message = "Failed to mark ticket as used";
        $messageType = "error";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Ticket - TEDx Dutse</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Verify Ticket - TEDx Dutse</h1>
            <p>
                <a href="dashboard.php">Dashboard</a> | 
                <a href="scanner.php">Scanner</a> | 
                <a href="logout.php">Logout</a>
            </p>
        </header>
        
        <?php if ($message): ?>
            <div class="alert <?php echo $messageType; ?>"><?php echo $message; ?></div>
        <?php endif; ?>
        
        <?php if ($ticket): ?>
            <div class="ticket-verification-result">
                <h2>Ticket Details</h2>
                
                <div class="ticket-details">
                    <div class="detail">
                        <span class="label">Reference:</span>
                        <span class="value"><?php echo $ticket['reference']; ?></span>
                    </div>
                    
                    <div class="detail">
                        <span class="label">Name:</span>
                        <span class="value"><?php echo htmlspecialchars($ticket['name']); ?></span>
                    </div>
                    
                    <div class="detail">
                        <span class="label">Email:</span>
                        <span class="value"><?php echo htmlspecialchars($ticket['email']); ?></span>
                    </div>
                    
                    <div class="detail">
                        <span class="label">Phone:</span>
                        <span class="value"><?php echo htmlspecialchars($ticket['phone']); ?></span>
                    </div>
                    
                    <div class="detail">
                        <span class="label">Ticket Type:</span>
                        <span class="value"><?php echo strtoupper($ticket['ticket_type']); ?></span>
                    </div>
                    
                    <div class="detail">
                        <span class="label">Amount Paid:</span>
                        <span class="value">₦<?php echo number_format($ticket['amount'], 2); ?></span>
                    </div>
                    
                    <div class="detail">
                        <span class="label">Status:</span>
                        <span class="value status <?php echo $ticket['status']; ?>"><?php echo ucfirst($ticket['status']); ?></span>
                    </div>
                    
                    <div class="detail">
                        <span class="label">Purchase Date:</span>
                        <span class="value"><?php echo date('M j, Y g:i A', strtotime($ticket['created_at'])); ?></span>
                    </div>
                    
                    <?php if ($ticket['verified_at']): ?>
                    <div class="detail">
                        <span class="label">Verified At:</span>
                        <span class="value"><?php echo date('M j, Y g:i A', strtotime($ticket['verified_at'])); ?></span>
                    </div>
                    <?php endif; ?>
                </div>
                
                <div class="qr-code">
                    <?php if ($ticket['qr_code'] && file_exists('../qr/' . $ticket['qr_code'])): ?>
                        <img src="../qr/<?php echo $ticket['qr_code']; ?>" alt="QR Code">
                    <?php else: ?>
                        <p>QR Code not available</p>
                    <?php endif; ?>
                </div>
                
                <?php if ($ticket['status'] == 'paid'): ?>
                    <div class="actions">
                        <a href="verify_ticket.php?reference=<?php echo $ticket['reference']; ?>&action=mark_used" class="btn">Mark as Used</a>
                    </div>
                <?php elseif ($ticket['status'] == 'used'): ?>
                    <p>This ticket was verified on <?php echo date('M j, Y g:i A', strtotime($ticket['verified_at'])); ?></p>
                <?php endif; ?>
            </div>
        <?php endif; ?>
        
        <div class="verify-another">
            <h2>Verify Another Ticket</h2>
            <form method="GET" action="verify_ticket.php">
                <input type="text" name="reference" placeholder="Enter ticket reference" required>
                <button type="submit">Verify</button>
            </form>
            <p>Or <a href="scanner.php">use the QR scanner</a></p>
        </div>
        
        <footer>
            <p>&copy; <?php echo date('Y'); ?> TEDx Dutse. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>