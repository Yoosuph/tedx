<?php
require_once 'config.php';
session_start();

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email']);
    
    if (empty($email)) {
        $error = 'Please enter your email address';
    } else {
        try {
            // Find tickets by email
            $stmt = $pdo->prepare("SELECT * FROM tickets WHERE email = ? ORDER BY created_at DESC");
            $stmt->execute([$email]);
            $tickets = $stmt->fetchAll();
            
            if (count($tickets) > 0) {
                // Send email with ticket links
                $subject = "Your TEDx Dutse Tickets";
                $message = "Hello,\n\nHere are your TEDx Dutse tickets:\n\n";
                
                foreach ($tickets as $ticket) {
                    $ticketUrl = SITE_URL . '/ticket.php?reference=' . $ticket['reference'];
                    $message .= "Ticket Reference: " . $ticket['reference'] . "\n";
                    $message .= "View Ticket: " . $ticketUrl . "\n";
                    $message .= "Type: " . ucfirst($ticket['ticket_type']) . "\n";
                    $message .= "Amount: ₦" . number_format($ticket['amount'], 2) . "\n";
                    $message .= "Status: " . ucfirst($ticket['status']) . "\n";
                    $message .= "Purchase Date: " . date('M j, Y g:i A', strtotime($ticket['created_at'])) . "\n\n";
                }
                
                $message .= "Please save this email for future reference.\n\n";
                $message .= "Thank you,\nTEDx Dutse Team";
                
                $headers = "From: no-reply@tedxdutse.com" . "\r\n" .
                           "Reply-To: info@tedxdutse.com" . "\r\n" .
                           "X-Mailer: PHP/" . phpversion();
                
                if (mail($email, $subject, $message, $headers)) {
                    $success = 'An email with your ticket information has been sent to ' . $email;
                } else {
                    $error = 'Failed to send email. Please try again later.';
                }
            } else {
                $error = 'No tickets found for this email address.';
            }
        } catch (Exception $e) {
            $error = 'An error occurred: ' . $e->getMessage();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recover Ticket - TEDx Dutse</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        .recovery-container {
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: white;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .ticket-list {
            margin-top: 20px;
        }
        
        .ticket-item {
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>TEDx Dutse Ticket Recovery</h1>
        </header>
        
        <div class="recovery-container">
            <?php if ($error): ?>
                <div class="alert error"><?php echo $error; ?></div>
            <?php endif; ?>
            
            <?php if ($success): ?>
                <div class="alert success"><?php echo $success; ?></div>
                <p>Please check your email inbox (and spam folder) for your ticket information.</p>
                <a href="index.php" class="btn">Return to Home</a>
            <?php else: ?>
                <form method="POST" action="">
                    <div class="form-group">
                        <label for="email">Email Address *</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    
                    <button type="submit">Find My Tickets</button>
                </form>
                
                <?php if (isset($tickets) && count($tickets) > 0): ?>
                <div class="ticket-list">
                    <h3>Your Tickets</h3>
                    <?php foreach ($tickets as $ticket): ?>
                    <div class="ticket-item">
                        <p><strong>Reference:</strong> <?php echo $ticket['reference']; ?></p>
                        <p><strong>Type:</strong> <?php echo ucfirst($ticket['ticket_type']); ?></p>
                        <p><strong>Amount:</strong> ₦<?php echo number_format($ticket['amount'], 2); ?></p>
                        <p><strong>Status:</strong> <span class="status <?php echo $ticket['status']; ?>"><?php echo ucfirst($ticket['status']); ?></span></p>
                        <p><strong>Purchase Date:</strong> <?php echo date('M j, Y g:i A', strtotime($ticket['created_at'])); ?></p>
                        <a href="ticket.php?reference=<?php echo $ticket['reference']; ?>" target="_blank">View Ticket</a>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            <?php endif; ?>
        </div>
        
        <footer>
            <p>&copy; <?php echo date('Y'); ?> TEDx Dutse. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>