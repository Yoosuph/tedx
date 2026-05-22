<?php
// test_qr.php
echo "<h1>Testing QR Code Generation</h1>";

// Check if QR code library exists
if (!file_exists('phpqrcode/qrlib.php')) {
    echo "<p style='color: red;'>ERROR: QR code library not found at: " . realpath('phpqrcode/qrlib.php') . "</p>";
    echo "<p>Please make sure you've downloaded the library from: https://sourceforge.net/projects/phpqrcode/</p>";
    echo "<p>And placed it in a folder called 'phpqrcode' in your project root.</p>";
    exit;
}

echo "<p>QR code library found.</p>";

// Check if we can include the library
require_once 'phpqrcode/qrlib.php';
echo "<p>QR code library included successfully.</p>";

// Check if qr directory exists and is writable
if (!file_exists('qr')) {
    if (mkdir('qr', 0755, true)) {
        echo "<p>Created QR directory.</p>";
    } else {
        echo "<p style='color: red;'>ERROR: Could not create QR directory.</p>";
        exit;
    }
}

if (!is_writable('qr')) {
    echo "<p style='color: red;'>ERROR: QR directory is not writable.</p>";
    echo "<p>Please change permissions on the 'qr' folder to make it writable.</p>";
    exit;
}

echo "<p>QR directory is writable.</p>";

// Test generating a QR code
$testData = "TEST12345";
$testFile = "test_qr.png";
$result = QRcode::png($testData, 'qr/' . $testFile, QR_ECLEVEL_L, 10);

if (file_exists('qr/' . $testFile)) {
    echo "<p>QR code generated successfully!</p>";
    echo "<img src='qr/$testFile' alt='Test QR Code'>";
    echo "<p>File: qr/$testFile</p>";
} else {
    echo "<p style='color: red;'>ERROR: QR code generation failed.</p>";
}

// Show server information that might help debugging
echo "<h2>Server Information</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>GD Library: " . (function_exists('imagecreate') ? "Enabled" : "Disabled") . "</p>";
echo "<p>Write Permissions: " . (is_writable('.') ? "Yes" : "No") . "</p>";

// Check for common issues
if (!function_exists('imagecreate')) {
    echo "<p style='color: red;'>WARNING: GD library is not enabled. This is required for QR code generation.</p>";
    echo "<p>Please enable the GD extension in your php.ini file.</p>";
}
?>