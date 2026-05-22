<?php
session_start();
require_once '../config.php';

if (!isAdminLoggedIn()) {
    header('Location: index.php');
    exit();
}

$error = '';
$success = '';
$ticket = null;

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['reference'])) {
        // Manual reference entry
        $reference = trim($_POST['reference']);
        $ticket = getTicketByReference($reference);
        
        if (!$ticket) {
            $error = 'Ticket not found with reference: ' . $reference;
        }
    } elseif (isset($_POST['qr_data'])) {
        // QR code scan
        $qrData = trim($_POST['qr_data']);
        $ticket = getTicketByQRData($qrData);
        
        if (!$ticket) {
            $error = 'Ticket not found for scanned QR code';
        }
    }
    
    // Mark as used if requested
    if ($ticket && isset($_POST['mark_used'])) {
        if (markTicketAsUsed($ticket['reference'])) {
            $success = 'Ticket marked as used successfully!';
            // Refresh ticket data
            $ticket = getTicketByReference($ticket['reference']);
        } else {
            $error = 'Failed to mark ticket as used';
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Scanner - TEDx Dutse Admin</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .scanner-container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .scanner-section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        #qr-reader {
            width: 100%;
            max-width: 500px;
            margin: 0 auto;
        }
        
        #qr-reader__dashboard_section {
            text-align: center;
        }
        
        #qr-reader__dashboard_section_swaplink {
            display: none; /* Hide the swap camera link */
        }
        
        .manual-input {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .ticket-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .detail-row {
            display: flex;
            margin-bottom: 10px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
        }
        
        .detail-label {
            font-weight: bold;
            width: 120px;
            color: #666;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
        }
        
        .status-paid {
            background: #d4edda;
            color: #155724;
        }
        
        .status-used {
            background: #d1ecf1;
            color: #0c5460;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .btn-primary {
            background: #e62b1e;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        
        .btn-primary:hover {
            background: #c62828;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>TEDx Dutse QR Scanner</h1>
            <p>
                <a href="dashboard.php">Dashboard</a> | 
                <a href="scanner.php">Scanner</a> | 
                <a href="logout.php">Logout</a>
            </p>
        </header>
        
        <?php if ($error): ?>
            <div class="alert error"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <?php if ($success): ?>
            <div class="alert success"><?php echo $success; ?></div>
        <?php endif; ?>
        
        <div class="scanner-container">
            <div class="scanner-section">
                <h2>Scan QR Code</h2>
                <div id="qr-reader"></div>
                <p>Or <a href="#" onclick="document.getElementById('manual-section').style.display='block'; return false;">enter reference manually</a></p>
            </div>
            
            <div class="manual-input" id="manual-section" style="display: none;">
                <h2>Manual Reference Entry</h2>
                <form method="POST">
                    <div class="form-group">
                        <label for="reference">Ticket Reference</label>
                        <input type="text" id="reference" name="reference" required>
                    </div>
                    <button type="submit">Lookup Ticket</button>
                </form>
            </div>
            
            <?php if ($ticket): ?>
            <div class="ticket-details">
                <h2>Ticket Details</h2>
                
                <div class="detail-row">
                    <span class="detail-label">Reference:</span>
                    <span><?php echo $ticket['reference']; ?></span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span><?php echo htmlspecialchars($ticket['name']); ?></span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span><?php echo htmlspecialchars($ticket['email']); ?></span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span><?php echo htmlspecialchars($ticket['phone']); ?></span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Ticket Type:</span>
                    <span><?php echo strtoupper($ticket['ticket_type']); ?></span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span>₦<?php echo number_format($ticket['amount'], 2); ?></span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="status-badge status-<?php echo $ticket['status']; ?>">
                        <?php echo ucfirst($ticket['status']); ?>
                    </span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Purchase Date:</span>
                    <span><?php echo date('M j, Y g:i A', strtotime($ticket['created_at'])); ?></span>
                </div>
                
                <?php if ($ticket['verified_at']): ?>
                <div class="detail-row">
                    <span class="detail-label">Verified At:</span>
                    <span><?php echo date('M j, Y g:i A', strtotime($ticket['verified_at'])); ?></span>
                </div>
                <?php endif; ?>
                
                <?php if ($ticket['status'] === 'paid'): ?>
                <form method="POST">
                    <input type="hidden" name="reference" value="<?php echo $ticket['reference']; ?>">
                    <input type="hidden" name="mark_used" value="1">
                    <button type="submit" class="btn-primary">Mark as Used</button>
                </form>
                <?php elseif ($ticket['status'] === 'used'): ?>
                <p>This ticket has already been used on <?php echo date('M j, Y g:i A', strtotime($ticket['verified_at'])); ?></p>
                <?php else: ?>
                <p>This ticket is pending payment and cannot be verified.</p>
                <?php endif; ?>
            </div>
            <?php endif; ?>
        </div>
    </div>

    <!-- Load the QR scanner library -->
    <script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
    <script>
    // QR Code Scanner
    function onScanSuccess(decodedText, decodedResult) {
        // Stop scanning
        html5QrcodeScanner.clear();
        
        // Show loading message
        document.getElementById('qr-reader').innerHTML = '<p>Processing ticket...</p>';
        
        // Submit the form with the scanned data
        const form = document.createElement('form');
        form.method = 'POST';
        
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'qr_data';
        input.value = decodedText;
        
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
    }

    function onScanFailure(error) {
        // Handle scan failure, but ignore most errors
        // console.log('QR scan failed:', error);
    }

    // Initialize scanner when page loads
    let html5QrcodeScanner;
    document.addEventListener('DOMContentLoaded', function() {
        // Check if browser supports camera access
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            document.getElementById('qr-reader').innerHTML = 
                '<p style="color: red;">Your browser does not support camera access.</p>' +
                '<p>Please use the manual reference entry instead.</p>';
            return;
        }
        
        try {
            html5QrcodeScanner = new Html5QrcodeScanner(
                "qr-reader", 
                { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
                },
                false
            );
            html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        } catch (error) {
            document.getElementById('qr-reader').innerHTML = 
                '<p style="color: red;">Error initializing scanner: ' + error.message + '</p>' +
                '<p>Please use the manual reference entry instead.</p>';
        }
    });
    </script>
</body>
</html>