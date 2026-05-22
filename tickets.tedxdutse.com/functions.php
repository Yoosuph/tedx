<?php
// Generate QR code
function generateQRCode($data, $filename) {
    // Check if QR code library exists
    if (!file_exists('phpqrcode/qrlib.php')) {
        error_log("QR code library not found");
        return false;
    }
    
    require_once 'phpqrcode/qrlib.php';
    
    // Create qr directory if it doesn't exist
    if (!file_exists('qr')) {
        if (!mkdir('qr', 0777, true)) {
            error_log("Failed to create QR directory");
            return false;
        }
    }
    
    $filepath = 'qr/' . $filename;
    
    try {
        // Generate QR code
        QRcode::png($data, $filepath, QR_ECLEVEL_L, 10);
        
        // Check if file was created
        if (file_exists($filepath)) {
            return $filepath;
        } else {
            error_log("QR code generation failed - file not created");
            return false;
        }
    } catch (Exception $e) {
        error_log("QR code generation error: " . $e->getMessage());
        return false;
    }
}

// Verify admin login
function verifyAdminLogin($username, $password) {
    global $pdo;
    
    $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ?");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();
    
    if ($admin && password_verify($password, $admin['password'])) {
        return $admin;
    }
    
    return false;
}

// Check if admin is logged in
function isAdminLoggedIn() {
    return isset($_SESSION['admin_id']);
}

// Get ticket by reference
function getTicketByReference($reference) {
    global $pdo;
    
    $stmt = $pdo->prepare("SELECT * FROM tickets WHERE reference = ?");
    $stmt->execute([$reference]);
    return $stmt->fetch();
}

// Update ticket status
function updateTicketStatus($reference, $status) {
    global $pdo;
    
    $stmt = $pdo->prepare("UPDATE tickets SET status = ? WHERE reference = ?");
    return $stmt->execute([$status, $reference]);
}

// Mark ticket as used/verified
function markTicketAsUsed($reference) {
    global $pdo;
    
    $stmt = $pdo->prepare("UPDATE tickets SET status = 'used', verified_at = NOW() WHERE reference = ?");
    return $stmt->execute([$reference]);
}

// Get ticket by QR code data (reference)
// Add this function to functions.php
function getReferenceFromQRData($qrData) {
    // Check if it's a URL containing a reference parameter
    if (filter_var($qrData, FILTER_VALIDATE_URL)) {
        $urlParts = parse_url($qrData);
        if (isset($urlParts['query'])) {
            parse_str($urlParts['query'], $queryParams);
            if (isset($queryParams['reference'])) {
                return $queryParams['reference'];
            }
        }
    }
    
    // If it's not a URL, assume it's just the reference
    return preg_replace('/[^A-Z0-9_]/', '', $qrData);
}

// Update the getTicketByQRData function to use the new function
function getTicketByQRData($qrData) {
    global $pdo;
    
    // Extract reference from QR data
    $reference = getReferenceFromQRData($qrData);
    
    $stmt = $pdo->prepare("SELECT * FROM tickets WHERE reference = ?");
    $stmt->execute([$reference]);
    return $stmt->fetch();
}
?>