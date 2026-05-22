<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once 'config.php';
session_start();

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action']) && $_POST['action'] === 'recover') {
        // Handle ticket recovery
        $email = trim($_POST['email']);
        if (!empty($email)) {
            try {
                $stmt = $pdo->prepare("SELECT * FROM tickets WHERE email = ? ORDER BY created_at DESC LIMIT 1");
                $stmt->execute([$email]);
                $ticket = $stmt->fetch();
                
                if ($ticket) {
                    // Redirect to ticket page instead of showing message
                    header('Location: ticket.php?reference=' . $ticket['reference']);
                    exit();
                } else {
                    $error = "No ticket found for this email address.";
                }
            } catch (Exception $e) {
                $error = "Error retrieving ticket. Please try again.";
            }
        } else {
            $error = "Please enter a valid email address.";
        }
    } else {
        // Handle ticket purchase
        $name = trim($_POST['name']);
        $email = trim($_POST['email']);
        $phone = trim($_POST['phone']);
        $ticket_type = $_POST['ticket_type'];
        
        if (empty($name) || empty($email) || empty($phone)) {
            $error = 'All fields are required';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = 'Please enter a valid email address';
        } else {
            try {
                $checkStmt = $pdo->prepare("SELECT * FROM tickets WHERE email = ? AND status = 'paid'");
                $checkStmt->execute([$email]);
                $existingTicket = $checkStmt->fetch();
                
                if ($existingTicket) {
                    $error = 'This email already has a purchased ticket. Use "Find My Ticket" to recover it.';
                } else {
                    // Set amount based on ticket type
                    if ($ticket_type === 'vip') {
                        $amount = 10000;
                    } elseif ($ticket_type === 'vvip') {
                        $amount = 25000;
                    } else {
                        $amount = 3000; // regular
                    }
                    
                    $reference = 'TEDX' . time() . rand(1000, 9999);
                    
                    try {
                        $stmt = $pdo->prepare("INSERT INTO tickets (ticket_type, name, email, phone, reference, amount) VALUES (?, ?, ?, ?, ?, ?)");
                        $stmt->execute([$ticket_type, $name, $email, $phone, $reference, $amount]);
                        
                        // Paystack initialization
                        $url = "https://api.paystack.co/transaction/initialize";
                        $fields = [
                            'email' => $email,
                            'amount' => $amount * 100,
                            'reference' => $reference,
                            'callback_url' => SITE_URL . '/verify_payment.php?reference=' . $reference,
                            'metadata' => json_encode([
                                'custom_fields' => [
                                    ['display_name' => 'Full Name', 'variable_name' => 'full_name', 'value' => $name],
                                    ['display_name' => 'Phone', 'variable_name' => 'phone', 'value' => $phone],
                                    ['display_name' => 'Ticket Type', 'variable_name' => 'ticket_type', 'value' => $ticket_type]
                                ]
                            ])
                        ];
                        
                        $ch = curl_init();
                        curl_setopt_array($ch, [
                            CURLOPT_URL => $url,
                            CURLOPT_POST => true,
                            CURLOPT_POSTFIELDS => http_build_query($fields),
                            CURLOPT_HTTPHEADER => [
                                "Authorization: Bearer " . PAYSTACK_SECRET_KEY,
                                "Cache-Control: no-cache",
                            ],
                            CURLOPT_RETURNTRANSFER => true,
                        ]);
                        
                        $result = curl_exec($ch);
                        $response = json_decode($result, true);
                        
                        if ($response['status'] && isset($response['data']['authorization_url'])) {
                            header('Location: ' . $response['data']['authorization_url']);
                            exit();
                        } else {
                            $error = 'Payment setup failed. Please try again.';
                        }
                    } catch (Exception $e) {
                        $error = 'Something went wrong. Please try again.';
                    }
                }
            } catch (Exception $e) {
                $error = 'Error checking existing tickets. Please try again.';
            }
        } // Close the else block for validation
    } // Close the else block for action check
} // Close the if for POST request
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TEDx Dutse Tickets</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
            line-height: 1.6;
        }

        .container {
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            text-align: center;
            margin-bottom: 32px;
            padding-top: 40px;
        }

        .logo {
            width: 100px;
            height: auto;
            margin: 0 auto 20px;
        }

        .logo img {
            max-width: 100%;
            height: auto;
            display: block;
        }

        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .header p {
            color: rgba(255, 255, 255, 0.8);
            font-size: 16px;
        }

        .card {
            background: white;
            border-radius: 20px;
            padding: 32px 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            flex: 1;
        }

        .alert {
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 24px;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        }

        .alert.error {
            background: #fef2f2;
            color: #dc2626;
            border-left: 4px solid #dc2626;
        }

        .alert.success {
            background: #f0fdf4;
            color: #16a34a;
            border-left: 4px solid #16a34a;
        }

        .form-group {
            margin-bottom: 24px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
        }

        input, select {
            width: 100%;
            padding: 16px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 16px;
            background: #f9fafb;
            transition: all 0.2s ease;
        }

        input:focus, select:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .ticket-options {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 32px;
        }

        .ticket-option {
            border: 3px solid #e5e7eb;
            border-radius: 16px;
            padding: 20px 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            background: white;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .ticket-option::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #667eea, #764ba2);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1;
        }

        .ticket-option > * {
            position: relative;
            z-index: 2;
        }

        .ticket-option:hover {
            border-color: #667eea;
            transform: translateY(-4px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
        }

        .ticket-option.selected {
            border-color: #667eea;
            background: #667eea;
            color: white;
            transform: translateY(-4px);
            box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
        }

        .ticket-option.selected::before {
            opacity: 1;
        }

        .ticket-option.selected .ticket-title,
        .ticket-option.selected .ticket-price,
        .ticket-option.selected .ticket-desc {
            color: white;
        }

        .ticket-option input[type="radio"] {
            display: none;
        }

        .ticket-title {
            font-weight: 700;
            font-size: 16px;
            color: #111827;
            margin-bottom: 8px;
            transition: color 0.3s ease;
        }

        .ticket-price {
            font-size: 20px;
            font-weight: 800;
            color: #667eea;
            margin-bottom: 6px;
            transition: color 0.3s ease;
        }

        .ticket-desc {
            font-size: 12px;
            color: #6b7280;
            transition: color 0.3s ease;
        }

        .btn {
            width: 100%;
            padding: 18px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-bottom: 24px;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .btn:active {
            transform: translateY(0);
        }

        .recovery-link {
            text-align: center;
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
        }

        .recovery-link a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
        }

        .recovery-link a:hover {
            text-decoration: underline;
        }

        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
        }

        .modal-content {
            background: white;
            margin: 10% auto;
            padding: 32px 24px;
            border-radius: 20px;
            width: 90%;
            max-width: 400px;
            position: relative;
            animation: modalSlide 0.3s ease;
        }

        .close {
            position: absolute;
            right: 20px;
            top: 20px;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            color: #9ca3af;
            transition: color 0.2s ease;
        }

        .close:hover {
            color: #374151;
        }

        .modal h2 {
            margin-bottom: 16px;
            color: #111827;
            font-size: 24px;
            font-weight: 700;
        }

        .modal p {
            color: #6b7280;
            margin-bottom: 24px;
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes modalSlide {
            from { opacity: 0; transform: translateY(-50px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 768px) {
            .ticket-options {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 480px) {
            .container {
                padding: 16px;
            }
            
            .card {
                padding: 24px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .modal-content {
                margin: 20% auto;
                padding: 24px 20px;
            }

            .ticket-options {
                grid-template-columns: 1fr;
                gap: 16px;
            }

            .ticket-option {
                padding: 24px 20px;
            }

            .ticket-title {
                font-size: 18px;
            }

            .ticket-price {
                font-size: 24px;
            }

            .ticket-desc {
                font-size: 14px;
            }
        }

        .footer {
            text-align: center;
            margin-top: 32px;
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <img src="logo.png" alt="TEDx Logo">
            </div>
            <h1>TEDx Dutse</h1>
            <p>Roots & Wings</p>
        </div>

        <div class="card">
            <?php if ($error): ?>
                <div class="alert error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            
            <?php if ($success): ?>
                <div class="alert success"><?php echo htmlspecialchars($success); ?></div>
            <?php endif; ?>

            <form method="POST" action="">
                <div class="form-group">
                    <label>Choose Your Ticket</label>
                    <div class="ticket-options">
                        <div class="ticket-option" onclick="selectTicket('regular', this)">
                            <input type="radio" name="ticket_type" value="regular" id="regular" required>
                            <div class="ticket-title">Regular</div>
                            <div class="ticket-price">₦3,000</div>
                            <div class="ticket-desc">Access to all TEDx talks and performances</div>
                        </div>
                        <div class="ticket-option" onclick="selectTicket('vip', this)">
                            <input type="radio" name="ticket_type" value="vip" id="vip" required>
                            <div class="ticket-title">VIP</div>
                            <div class="ticket-price">₦10,000</div>
                            <div class="ticket-desc">Premium Experience</div>
                            <div class="ticket-desc">All Standard access</div>
                            <div class="ticket-desc">Priority seating</div>
                        
                            <div class="ticket-desc">TEDxDutse souvenir pack</div>
                            <div class="ticket-desc">Lunch</div>
                        </div>
                        <div class="ticket-option" onclick="selectTicket('vvip', this)">
                            <input type="radio" name="ticket_type" value="vvip" id="vvip" required>
                            <div class="ticket-title">V.VIP</div>
                            <div class="ticket-price">₦25,000</div>
                            <div class="ticket-desc">Ultimate Premium Experience</div>
                            <div class="ticket-desc">All VIP benefits</div>
                            <div class="ticket-desc">Backstage access</div>
                             <div class="ticket-desc">Exclusive networking session</div>
                          
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" name="name" required placeholder="Enter your full name">
                </div>

                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required placeholder="your@email.com">
                </div>

                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" required placeholder="+234 800 000 0000">
                </div>
                <div class="ticket-desc">
  By completing your payment, you acknowledge that you have read and agreed to the 
  <a href="terms.html" target="_blank">Terms &amp; Conditions</a>.
</div>
                <button type="submit" class="btn">Secure Payment →</button>
            </form>

            <div class="recovery-link">
                <a href="#" onclick="openModal()">Tap To Find Existing Ticket</a>
            </div>
           Need Support ? <p><i class="fas fa-phone-alt"></i> <a href="tel:+2349033773213">Click to call us</a></p>
        </div>

        <div class="footer">
            
            <p>&copy; <?php echo date('Y'); ?> TEDx Dutse. All rights reserved.</p>
        </div>
    </div>

    <!-- Recovery Modal -->
    <div id="recoverModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>Find My Ticket</h2>
            <p>Enter your email to retrieve your ticket details.</p>
            <form method="POST" action="">
                <input type="hidden" name="action" value="recover">
                <div class="form-group">
                    <label for="recover_email">Email Address</label>
                    <input type="email" id="recover_email" name="email" required placeholder="your@email.com">
                </div>
                <button type="submit" class="btn">Find Ticket</button>
            </form>
        </div>
    </div>

    <script>
        function selectTicket(type, element) {
            // Remove selected class from all options
            document.querySelectorAll('.ticket-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            element.classList.add('selected');
            
            // Check the radio button
            document.getElementById(type).checked = true;
        }

        function openModal() {
            document.getElementById('recoverModal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('recoverModal').style.display = 'none';
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('recoverModal');
            if (event.target === modal) {
                closeModal();
            }
        }

        // Auto-select first ticket option on load
        document.addEventListener('DOMContentLoaded', function() {
            const firstOption = document.querySelector('.ticket-option');
            if (firstOption) {
                selectTicket('regular', firstOption);
            }
        });
    </script>
</body>
</html>