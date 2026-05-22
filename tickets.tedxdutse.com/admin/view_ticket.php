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

// Get ticket reference from URL
if (isset($_GET['reference'])) {
    $reference = $_GET['reference'];
    $ticket = getTicketByReference($reference);
    
    if (!$ticket) {
        $message = "Ticket not found with reference: $reference";
        $messageType = "error";
    }
} else {
    $message = "No ticket reference provided";
    $messageType = "error";
}

// Mark as used if requested
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
    <title>View Ticket - TEDx Dutse Admin</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        .ticket-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .ticket-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        
        .ticket-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .detail-item {
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        
        .detail-label {
            font-weight: bold;
            color: #666;
            margin-bottom: 5px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
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
        
        .qr-section {
            text-align: center;
            margin: 20px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .qr-section img {
            max-width: 200px;
            height: auto;
            border: 1px solid #ddd;
            padding: 10px;
            background: white;
        }
        
        .action-buttons {
            text-align: center;
            margin-top: 20px;
        }
        
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #e62b1e;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 0 5px;
            border: none;
            cursor: pointer;
            font-size: 16px;
        }
        
        .btn:hover {
            background: #c62828;
        }
        
        .btn-secondary {
            background: #6c757d;
        }
        
        .btn-secondary:hover {
            background: #5a6268;
        }
        
        .btn-success {
            background: #28a745;
        }
        
        .btn-success:hover {
            background: #218838;
        }
        
        @media (max-width: 768px) {
            .ticket-details {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>TEDx Dutse - View Ticket</h1>
            <p>
                <a href="dashboard.php">Dashboard</a> | 
                <a href="scanner.php">Scanner</a> | 
                <a href="verify_ticket.php">Verify Ticket</a> | 
                <a href="logout.php">Logout</a>
            </p>
        </header>
        
        <?php if ($message): ?>
            <div class="alert <?php echo $messageType; ?>"><?php echo $message; ?></div>
        <?php endif; ?>
        
        <?php if ($ticket): ?>
        <div class="ticket-container">
            <div class="ticket-header">
                <h2>Ticket Details</h2>
                <p>Reference: <strong><?php echo $ticket['reference']; ?></strong></p>
            </div>
            
            <div class="ticket-details">
                <div class="detail-item">
                    <div class="detail-label">Name</div>
                    <div><?php echo htmlspecialchars($ticket['name']); ?></div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">Email</div>
                    <div><?php echo htmlspecialchars($ticket['email']); ?></div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">Phone</div>
                    <div><?php echo htmlspecialchars($ticket['phone']); ?></div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">Ticket Type</div>
                    <div><?php echo strtoupper($ticket['ticket_type']); ?></div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">Amount Paid</div>
                    <div>₦<?php echo number_format($ticket['amount'], 2); ?></div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div>
                        <span class="status-badge status-<?php echo $ticket['status']; ?>">
                            <?php echo ucfirst($ticket['status']); ?>
                        </span>
                    </div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">Purchase Date</div>
                    <div><?php echo date('M j, Y g:i A', strtotime($ticket['created_at'])); ?></div>
                </div>
                
                <?php if ($ticket['verified_at']): ?>
                <div class="detail-item">
                    <div class="detail-label">Verified At</div>
                    <div><?php echo date('M j, Y g:i A', strtotime($ticket['verified_at'])); ?></div>
                </div>
                <?php endif; ?>
            </div>
            
            <div class="qr-section">
                <h3>QR Code</h3>
                <?php if ($ticket['qr_code'] && file_exists('../qr/' . $ticket['qr_code'])): ?>
                    <img src="../qr/<?php echo $ticket['qr_code']; ?>" alt="QR Code">
                    <p>Scan this code to view these details</p>
                <?php else: ?>
                    <p>QR Code not available</p>
                <?php endif; ?>
            </div>
            
            <div class="action-buttons">
                <?php if ($ticket['status'] == 'paid'): ?>
                    <a href="view_ticket.php?reference=<?php echo $ticket['reference']; ?>&action=mark_used" class="btn btn-success">Mark as Used</a>
                <?php elseif ($ticket['status'] == 'used'): ?>
                    <p>This ticket was verified on <?php echo date('M j, Y g:i A', strtotime($ticket['verified_at'])); ?></p>
                <?php endif; ?>
                
                <a href="verify_ticket.php?reference=<?php echo $ticket['reference']; ?>" class="btn">Verify Another Way</a>
                <a href="dashboard.php" class="btn btn-secondary">Back to Dashboard</a>
            </div>
        </div>
        <?php else: ?>
        <div class="alert error">
            <p>No ticket found with the provided reference.</p>
            <p><a href="verify_ticket.php">Try verifying a ticket manually</a></p>
        </div>
        <?php endif; ?>
        
        <footer>
            <p>&copy; <?php echo date('Y'); ?> TEDx Dutse. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>