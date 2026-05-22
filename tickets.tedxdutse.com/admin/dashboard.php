<?php
session_start();
require_once '../config.php';

if (!isAdminLoggedIn()) {
    header('Location: index.php');
    exit();
}

// Get all tickets
$stmt = $pdo->query("SELECT * FROM tickets WHERE status='paid' ORDER BY created_at DESC");
$tickets = $stmt->fetchAll();

// Get statistics
$stmt = $pdo->query("SELECT COUNT(*) as total, 
                     SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
                     SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) as used,
                     SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                     SUM(amount) as revenue FROM tickets WHERE status='paid'");
$stats = $stmt->fetch();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TEDx Dutse - Admin Dashboard</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    
</head>
<body>
    <div class="container">
        <header>
            <h1>TEDx Dutse Admin Dashboard</h1>
            
            <p>
    Welcome, <?php echo $_SESSION['admin_username']; ?> | 
    <a href="scanner.php">QR Scanner</a> | 
    <a href="logout.php">Logout</a>
</p>
        </header>
        
        <div class="stats">
            <div class="stat-card">
                <h3>Total Tickets</h3>
                <p><?php echo $stats['total']; ?></p>
            </div>
            
            <div class="stat-card">
                <h3>Paid Tickets</h3>
                <p><?php echo $stats['paid']; ?></p>
            </div>
            
            <div class="stat-card">
                <h3>Used Tickets</h3>
                <p><?php echo $stats['used']; ?></p>
            </div>
            
            <div class="stat-card">
                <h3>Pending Payments</h3>
                <p><?php echo $stats['pending']; ?></p>
            </div>
            <div class="stat-card">
    <h3>QR Scanner</h3>
    <p><a href="scanner.php" style="color: #e62b1e; text-decoration: none;">Scan Tickets →</a></p>
</div>
            <div class="stat-card">
                <h3>Total Successful Revenue</h3>
                <p>₦<?php echo number_format($stats['revenue'], 2); ?></p>
            </div>
        </div>
        
        <div class="ticket-verification">
            <h2>Verify Ticket</h2>
            <form method="GET" action="verify_ticket.php">
                <input type="text" name="reference" placeholder="Enter ticket reference" required>
                <button type="submit">Verify</button>
            </form>
        </div>
        
        <div class="tickets-list">
            <h2>All Tickets</h2>
            
            <table>
                <thead>
                    <tr>
                        <th>Reference</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($tickets as $ticket): ?>
                    <tr>
                        <td><?php echo $ticket['reference']; ?></td>
                        <td><?php echo htmlspecialchars($ticket['name']); ?></td>
                        <td><?php echo htmlspecialchars($ticket['email']); ?></td>
                        <td><?php echo strtoupper($ticket['ticket_type']); ?></td>
                        <td>₦<?php echo number_format($ticket['amount'], 2); ?></td>
                        <td><span class="status <?php echo $ticket['status']; ?>"><?php echo ucfirst($ticket['status']); ?></span></td>
                        <td><?php echo date('M j, Y g:i A', strtotime($ticket['created_at'])); ?></td>
                        <td>
                            <a href="../admin/ticket.php?reference=<?php echo $ticket['reference']; ?>" target="_blank">View</a>
                            <?php if ($ticket['status'] == 'paid'): ?>
                                | <a href="verify_ticket.php?reference=<?php echo $ticket['reference']; ?>&action=mark_used">Mark Used</a>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        
        <footer>
            <p>&copy; <?php echo date('Y'); ?> TEDx Dutse. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>