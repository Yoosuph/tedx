<?php
// fix_permissions.php
echo "<h1>Fixing QR Directory Permissions</h1>";

// Check if qr directory exists
if (!file_exists('qr')) {
    if (mkdir('qr', 0755, true)) {
        echo "<p>Created QR directory successfully.</p>";
    } else {
        echo "<p style='color: red;'>Failed to create QR directory.</p>";
        exit;
    }
}

// Try to change permissions
if (chmod('qr', 0755)) {
    echo "<p>Changed QR directory permissions to 755.</p>";
} else {
    echo "<p style='color: red;'>Could not change permissions automatically.</p>";
    echo "<p>You need to manually set permissions:</p>";
    echo "<ul>";
    echo "<li>Via FTP: Right-click on 'qr' folder → File Permissions → Set to 755</li>";
    echo "<li>Via cPanel: File Manager → Right-click 'qr' → Change Permissions → Set to 755</li>";
    echo "<li>Via SSH: Run command: <code>chmod 755 qr</code></li>";
    echo "</ul>";
}

// Test if it's writable
if (is_writable('qr')) {
    echo "<p style='color: green;'>SUCCESS: QR directory is now writable!</p>";
    
    // Test QR code generation
    if (!file_exists('phpqrcode/qrlib.php')) {
        echo "<p style='color: red;'>QR code library not found.</p>";
        exit;
    }
    
    require_once 'phpqrcode/qrlib.php';
    
    $testData = "TEST12345";
    $testFile = "test_qr.png";
    QRcode::png($testData, 'qr/' . $testFile, QR_ECLEVEL_L, 10);
    
    if (file_exists('qr/' . $testFile)) {
        echo "<p style='color: green;'>QR code generation test successful!</p>";
        echo "<img src='qr/$testFile' alt='Test QR Code'>";
    } else {
        echo "<p style='color: red;'>QR code generation failed even with writable directory.</p>";
    }
} else {
    echo "<p style='color: red;'>QR directory is still not writable after attempting to fix.</p>";
    echo "<p>Please manually change permissions as described above.</p>";
}

echo "<p><a href='test_qr.php'>Test Again</a> | <a href='index.php'>Go to Main Page</a></p>";

// Show current permissions
echo "<h2>Current Directory Status</h2>";
echo "<p>QR directory exists: " . (file_exists('qr') ? "Yes" : "No") . "</p>";
echo "<p>QR directory is writable: " . (is_writable('qr') ? "Yes" : "No") . "</p>";
$perms = fileperms('qr');
echo "<p>QR directory permissions: " . substr(sprintf('%o', $perms), -4) . "</p>";
?>