<?php
require_once 'config.php';
session_start();

if (!isset($_GET['reference'])) {
    header('Location: index.php');
    exit();
}

$reference = $_GET['reference'];
$ticket = getTicketByReference($reference);

if (!$ticket) {
    die('Ticket not found');
}

// If ticket is paid but no QR code exists, generate it
if ($ticket['status'] === 'paid' && empty($ticket['qr_code'])) {
    // Create URL that points to the admin view_ticket page
    $qrData = SITE_URL . '/admin/view_ticket.php?reference=' . $reference;
    $qrFilename = 'TEDX_' . $reference . '.png';
    $qrPath = generateQRCode($qrData, $qrFilename);
    
    // Update ticket with QR code path
    $stmt = $pdo->prepare("UPDATE tickets SET qr_code = ? WHERE reference = ?");
    $stmt->execute([$qrFilename, $reference]);
    
    // Refresh ticket data
    $ticket = getTicketByReference($reference);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your TEDx Dutse Ticket</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <style>
        :root {
            --tedx-red: #e62b1e;
            --tedx-dark: #1a1a1a;
            --shadow-soft: 0 8px 25px rgba(0, 0, 0, 0.1);
            --border-radius: 20px;
            --transition: all 0.3s ease;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: var(--tedx-dark);
            padding: 20px;
        }

        .container {
            max-width: 480px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            margin-bottom: 24px;
            color: white;
        }

        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .header p {
            opacity: 0.8;
            font-size: 16px;
        }

        /* Modern Ticket Design */
        .ticket {
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-soft);
            overflow: hidden;
            position: relative;
            margin-bottom: 24px;
        }

        .ticket::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(90deg, var(--tedx-red) 0%, #ff4757 100%);
        }

        .ticket-header {
            background: green;
            padding: 32px 24px;
            text-align: center;
            color: white;
            position: relative;
        }

        .ticket-header::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            box-shadow: 
                -40px 0 0 white,
                40px 0 0 white,
                -80px 0 0 white,
                80px 0 0 white,
                -120px 0 0 white,
                120px 0 0 white,
                -160px 0 0 white,
                160px 0 0 white;
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

        .ticket-logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 20px;
            backdrop-filter: blur(10px);
        }

        .ticket-header h2 {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 8px;
        }

        .event-info {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 16px;
            line-height: 1.5;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
        }

        .ticket-body {
            padding: 32px 24px 24px;
        }

        /* Enhanced QR Code Section */
        .qr-section-top {
            text-align: center;
            padding: 24px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 16px;
            margin-bottom: 24px;
            border: 2px dashed #dee2e6;
        }

        .qr-section-top .qr-code {
            background: white;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            margin-bottom: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 172px;
            height: 172px;
        }

        .qr-section-top .qr-code img {
            width: 140px;
            height: 140px;
            display: block;
            /* Enhanced image rendering for QR codes */
            image-rendering: -moz-crisp-edges;
            image-rendering: -webkit-crisp-edges;
            image-rendering: pixelated;
            image-rendering: crisp-edges;
            -ms-interpolation-mode: nearest-neighbor;
            transform: translateZ(0);
            object-fit: contain;
            object-position: center;
            filter: contrast(1.1);
            /* Ensure the image is fully loaded before PDF generation */
            opacity: 1;
            transition: opacity 0.3s ease;
        }

        .qr-section-top .qr-info {
            font-size: 14px;
            color: #666;
            font-weight: 600;
        }

        /* QR code fallback styling */
        .qr-fallback {
            width: 140px;
            height: 140px;
            background: linear-gradient(45deg, #f8f9fa 25%, transparent 25%),
                        linear-gradient(-45deg, #f8f9fa 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #f8f9fa 75%),
                        linear-gradient(-45deg, transparent 75%, #f8f9fa 75%);
            background-size: 10px 10px;
            background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
            border: 2px dashed #dee2e6;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #666;
            text-align: center;
            line-height: 1.2;
        }

        /* Side-by-Side Details Grid */
        .ticket-details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .details-column {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        /* Ticket Footer */
        .ticket-footer {
            background: #f8f9fa;
            padding: 20px 24px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }

        .reference-code {
            font-family: 'Monaco', 'Courier New', monospace;
            font-weight: bold;
            color: var(--tedx-red);
            background: rgba(230, 43, 30, 0.1);
            padding: 8px 12px;
            border-radius: 8px;
            display: inline-block;
            font-size: 14px;
            margin-bottom: 8px;
        }

        .purchase-date {
            font-size: 12px;
            color: #666;
        }

        /* Action Buttons */
        .actions {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px;
            margin-bottom: 24px;
        }

        .btn {
            padding: 16px 20px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            transition: var(--transition);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: none;
            cursor: pointer;
            font-size: 14px;
        }

        .btn-primary {
            background: var(--tedx-red);
            color: white;
        }

        .btn-secondary {
            background: white;
            color: var(--tedx-dark);
            border: 2px solid rgba(255, 255, 255, 0.8);
        }

        .btn-success {
            background: #28a745;
            color: white;
        }
        
        .btn-info {
            background: #17a2b8;
            color: white;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .btn-full {
            grid-column: 1 / -1;
        }

        /* Info Card */
        .info-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 20px;
            border-radius: 16px;
            text-align: center;
            color: white;
            margin-bottom: 24px;
        }

        .info-card h3 {
            margin-bottom: 16px;
            font-size: 18px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            font-size: 14px;
        }

        .info-grid p {
            padding: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
        }

        /* Loading Spinner */
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid var(--tedx-red);
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Save Image Specific */
        .saving-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            color: white;
            flex-direction: column;
            gap: 16px;
        }

        /* Print Styles */
        @media print {
            body {
                background: white;
                color: black;
                padding: 0;
            }
            
            .actions, .header, .info-card {
                display: none;
            }
            
            .ticket {
                box-shadow: none;
                border: 1px solid #ddd;
                margin: 0;
            }
            
            .container {
                max-width: none;
                margin: 0;
                padding: 0;
            }

            .qr-section-top .qr-code img {
                filter: contrast(1.2) brightness(0.9);
                image-rendering: -moz-crisp-edges;
                image-rendering: crisp-edges;
                mix-blend-mode: multiply;
            }
            
            .qr-section-top {
                break-inside: avoid;
                page-break-inside: avoid;
            }
        }

        /* Mobile Responsiveness */
        @media (max-width: 480px) {
            .container {
                padding: 16px;
            }
            
            .ticket-body {
                padding: 24px 20px 20px;
            }
            
            .actions {
                grid-template-columns: 1fr;
                gap: 12px;
            }
            
            .ticket-details-grid {
                grid-template-columns: 1fr;
                gap: 16px;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
                gap: 8px;
            }
            
            .qr-section-top .qr-code img {
                width: 120px;
                height: 120px;
            }

            .qr-section-top .qr-code {
                width: 152px;
                height: 152px;
            }
        }

        /* Slide animations for notifications */
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your TEDx Ticket</h1>
            <p>Keep this safe for event entry</p>
        </div>
        
        <div class="ticket" id="ticket-container">
            <div class="ticket-header">
              <div class="logo">
            <img src="logo.png" alt="TEDx Logo">
        </div>
                <div class="event-info">
                    <div><i class="fas fa-calendar"></i> November 29, 2025 | 9:00 AM</div>
                    <div><i class="fas fa-map-marker-alt"></i> Banquet Hall, Government House, Dutse, Jigawa State.</div>
                </div>
                <div class="status-badge">
                    <?php if($ticket['status'] === 'paid'): ?>
                        <i class="fas fa-check-circle"></i> Confirmed
                    <?php elseif($ticket['status'] === 'pending'): ?>
                        <i class="fas fa-clock"></i> Pending
                    <?php else: ?>
                        <i class="fas fa-times-circle"></i> <?php echo ucfirst($ticket['status']); ?>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="ticket-body">
                <!-- Enhanced QR Code Section -->
                <?php if ($ticket['status'] === 'paid' && $ticket['qr_code'] && file_exists('qr/' . $ticket['qr_code'])): ?>
                <div class="qr-section-top">
                    <div class="qr-code">
                        <?php
                        // Enhanced QR code display with cache busting
                        $qrPath = 'qr/' . $ticket['qr_code'];
                        $qrFullPath = __DIR__ . '/' . $qrPath;
                        
                        if (file_exists($qrFullPath) && is_readable($qrFullPath)) {
                            $fileTime = filemtime($qrFullPath);
                            echo '<img src="' . $qrPath . '?v=' . $fileTime . '" alt="QR Code" crossorigin="anonymous" loading="eager">';
                        } else {
                            echo '<div class="qr-fallback">QR Code<br>Unavailable</div>';
                        }
                        ?>
                    </div>
                    <div class="qr-info">
                        <i class="fas fa-qrcode"></i> Scan at venue for entry
                    </div>
                </div>
                <?php elseif ($ticket['status'] === 'paid'): ?>
                <div class="qr-section-top">
                    <div class="spinner"></div>
                    <div class="qr-info">Generating QR Code...</div>
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 12px; padding: 8px 16px; font-size: 12px;">
                        <i class="fas fa-refresh"></i> Refresh
                    </button>
                    <script>
                        // Auto-refresh if QR code is being generated
                        setTimeout(function() {
                            location.reload();
                        }, 5000);
                    </script>
                </div>
                <?php else: ?>
                <div class="qr-section-top">
                    <div style="padding: 20px;">
                        <i class="fas fa-clock" style="font-size: 2rem; color: #ffc107; margin-bottom: 12px;"></i>
                        <div class="qr-info" style="color: #856404;">Payment Required</div>
                        <p style="color: #856404; font-size: 12px; margin-top: 8px;">QR code available after payment</p>
                    </div>
                </div>
                <?php endif; ?>
                
                <!-- Ticket Details in Side-by-Side Layout -->
                <div class="ticket-details-grid">
                    <div class="details-column">
                        <div class="info-item">
                            <div class="info-label">Name</div>
                            <div class="info-value"><?php echo htmlspecialchars($ticket['name']); ?></div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Email</div>
                            <div class="info-value"><?php echo htmlspecialchars($ticket['email']); ?></div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Phone</div>
                            <div class="info-value"><?php echo htmlspecialchars($ticket['phone']); ?></div>
                        </div>
                    </div>
                    
                    <div class="details-column">
                        <div class="info-item">
                            <div class="info-label">Ticket Type</div>
                            <div class="info-value"><?php echo strtoupper($ticket['ticket_type']); ?></div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Amount Paid</div>
                            <div class="info-value">₦<?php echo number_format($ticket['amount'], 0); ?></div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Purchase Date</div>
                            <div class="info-value"><?php echo date('M j, Y', strtotime($ticket['created_at'])); ?></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="ticket-footer">
                <div class="reference-code"><?php echo $ticket['reference']; ?></div>
                <div class="purchase-date">
                    Purchased <?php echo date('M j, Y', strtotime($ticket['created_at'])); ?>
                </div>
            </div>
        </div>
        
        <div class="actions">
            <button onclick="saveAsPDF()" class="btn btn-success">
                <i class="fas fa-file-pdf"></i> Save PDF
            </button>
            <button onclick="saveAsImage()" class="btn btn-info">
                <i class="fas fa-image"></i> Save Image
            </button>
            <button onclick="window.print()" class="btn btn-primary">
                <i class="fas fa-print"></i> Print
            </button>
        </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="index.php" class="btn btn-secondary btn-full">
                <i class="fas fa-plus"></i> Buy Another Ticket
            </a>
        </div>
    </div>

    <!-- Loading Overlay -->
    <div class="saving-overlay" id="saving-overlay">
        <div class="spinner"></div>
        <p id="saving-message">Saving your ticket...</p>
    </div>

    <footer style="text-align: center; padding: 30px; color: rgba(255, 255, 255, 0.8); font-size: 14px;">
        <p>&copy; <?php echo date('Y'); ?> TEDx Dutse. All rights reserved.</p>
    </footer>

    <script>
        // Enhanced PDF generation function with QR code support
        async function saveAsPDF() {
            const overlay = document.getElementById('saving-overlay');
            const message = document.getElementById('saving-message');
            const ticketElement = document.getElementById('ticket-container');
            
            try {
                // Show loading overlay
                overlay.style.display = 'flex';
                message.textContent = 'Processing images...';
                
                // Wait for all images to load completely
                await waitForImages();
                
                message.textContent = 'Generating PDF...';
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Create canvas with enhanced options for QR code rendering
                const canvas = await html2canvas(ticketElement, {
                    backgroundColor: '#ffffff',
                    scale: 3, // Increased scale for better QR code quality
                    useCORS: true,
                    allowTaint: false,
                    logging: false,
                    width: ticketElement.offsetWidth,
                    height: ticketElement.offsetHeight,
                    imageTimeout: 15000,
                    removeContainer: true,
                    foreignObjectRendering: false,
                    // Force image rendering
                    onclone: function(clonedDoc) {
                        // Find all QR code images in the cloned document
                        const qrImages = clonedDoc.querySelectorAll('img[src*="qr/"]');
                        qrImages.forEach(img => {
                            // Ensure image is loaded and has dimensions
                            if (img.naturalWidth === 0) {
                                img.style.display = 'none';
                            } else {
                                img.crossOrigin = 'anonymous';
                                img.style.imageRendering = 'pixelated';
                                img.style.imageRendering = '-moz-crisp-edges';
                                img.style.imageRendering = 'crisp-edges';
                            }
                        });
                        return clonedDoc;
                    }
                });
                
                message.textContent = 'Creating PDF...';
                
                // Initialize jsPDF
                const { jsPDF } = window.jspdf;
                
                // Calculate dimensions for A4
                const imgWidth = 210; // A4 width in mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });
                
                // Convert canvas to high-quality image
                const imgData = canvas.toDataURL('image/png', 1.0);
                
                // Add the image to PDF
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
                
                // Save the PDF
                pdf.save(`TEDx-Dutse-Ticket-<?php echo $ticket['reference']; ?>.pdf`);
                
                overlay.style.display = 'none';
                showNotification('PDF saved successfully!', 'success');
                
            } catch (error) {
                console.error('Error generating PDF:', error);
                overlay.style.display = 'none';
                
                // Try alternative method with embedded QR
                showNotification('Trying enhanced PDF method...', 'info');
                setTimeout(() => saveAsPDFWithEmbeddedQR(), 1000);
            }
        }
        
        // Function to save ticket as image
        async function saveAsImage() {
            const overlay = document.getElementById('saving-overlay');
            const message = document.getElementById('saving-message');
            const ticketElement = document.getElementById('ticket-container');
            
            try {
                // Show loading overlay
                overlay.style.display = 'flex';
                message.textContent = 'Processing images...';
                
                // Wait for all images to load completely
                await waitForImages();
                
                message.textContent = 'Generating image...';
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Create canvas with enhanced options for QR code rendering
                const canvas = await html2canvas(ticketElement, {
                    backgroundColor: '#ffffff',
                    scale: 3, // Increased scale for better QR code quality
                    useCORS: true,
                    allowTaint: false,
                    logging: false,
                    width: ticketElement.offsetWidth,
                    height: ticketElement.offsetHeight,
                    imageTimeout: 15000,
                    removeContainer: true,
                    foreignObjectRendering: false,
                    // Force image rendering
                    onclone: function(clonedDoc) {
                        // Find all QR code images in the cloned document
                        const qrImages = clonedDoc.querySelectorAll('img[src*="qr/"]');
                        qrImages.forEach(img => {
                            // Ensure image is loaded and has dimensions
                            if (img.naturalWidth === 0) {
                                img.style.display = 'none';
                            } else {
                                img.crossOrigin = 'anonymous';
                                img.style.imageRendering = 'pixelated';
                                img.style.imageRendering = '-moz-crisp-edges';
                                img.style.imageRendering = 'crisp-edges';
                            }
                        });
                        return clonedDoc;
                    }
                });
                
                message.textContent = 'Creating image file...';
                
                // Convert canvas to image data URL
                const imgData = canvas.toDataURL('image/png', 1.0);
                
                // Create a temporary link to download the image
                const link = document.createElement('a');
                link.download = `TEDx-Dutse-Ticket-<?php echo $ticket['reference']; ?>.png`;
                link.href = imgData;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                overlay.style.display = 'none';
                showNotification('Image saved successfully!', 'success');
                
            } catch (error) {
                console.error('Error generating image:', error);
                overlay.style.display = 'none';
                showNotification('Image generation failed. Please try again.', 'error');
            }
        }

        // Enhanced method that embeds QR code directly
        async function saveAsPDFWithEmbeddedQR() {
            const overlay = document.getElementById('saving-overlay');
            const message = document.getElementById('saving-message');
            
            try {
                overlay.style.display = 'flex';
                message.textContent = 'Processing QR code...';
                
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF();
                
                // Get QR code image data
                const qrImg = document.querySelector('img[src*="qr/"]');
                let qrDataURL = null;
                
                if (qrImg && qrImg.complete) {
                    // Convert QR image to data URL
                    qrDataURL = await imageToDataURL(qrImg);
                }
                
                message.textContent = 'Creating enhanced PDF...';
                
                let yPosition = 20;
                
                // Header with styling
                pdf.setFillColor(230, 43, 30);
                pdf.rect(0, 0, 210, 15, 'F');
                
                pdf.setFontSize(24);
                pdf.setFont(undefined, 'bold');
                pdf.setTextColor(255, 255, 255);
                pdf.text('TEDx Dutse 2024', 105, 10, { align: 'center' });
                
                yPosition += 25;
                
                // Event info
                pdf.setFontSize(12);
                pdf.setTextColor(100, 100, 100);
                pdf.text('November 29, 2025 | 9:00 AM | Banquet Hall, Dutse', 105, yPosition, { align: 'center' });
                
                yPosition += 20;
                
                // Add QR code if available
                if (qrDataURL) {
                    pdf.setFontSize(14);
                    pdf.setTextColor(0, 0, 0);
                    pdf.text('Entry QR Code:', 105, yPosition, { align: 'center' });
                    yPosition += 10;
                    
                    // Add QR code image
                    const qrSize = 40; // 40mm x 40mm
                    const qrX = (210 - qrSize) / 2; // Center horizontally
                    pdf.addImage(qrDataURL, 'PNG', qrX, yPosition, qrSize, qrSize);
                    yPosition += qrSize + 15;
                    
                    pdf.setFontSize(10);
                    pdf.setTextColor(100, 100, 100);
                    pdf.text('Present this QR code at venue entrance', 105, yPosition, { align: 'center' });
                    yPosition += 15;
                }
                
                // Status box
                pdf.setFillColor(240, 248, 255);
                pdf.rect(15, yPosition, 180, 15, 'F');
                pdf.setFontSize(14);
                pdf.setTextColor(0, 0, 0);
                pdf.text('Status: <?php echo strtoupper($ticket['status']); ?>', 20, yPosition + 10);
                
                yPosition += 25;
                
                // Ticket details
                const details = [
                    ['Name:', '<?php echo htmlspecialchars($ticket['name']); ?>'],
                    ['Email:', '<?php echo htmlspecialchars($ticket['email']); ?>'],
                    ['Phone:', '<?php echo htmlspecialchars($ticket['phone']); ?>'],
                    ['Ticket Type:', '<?php echo strtoupper($ticket['ticket_type']); ?>'],
                    ['Amount Paid:', '₦<?php echo number_format($ticket['amount'], 0); ?>'],
                    ['Reference Code:', '<?php echo $ticket['reference']; ?>'],
                    ['Purchase Date:', '<?php echo date('M j, Y', strtotime($ticket['created_at'])); ?>']
                ];
                
                pdf.setFontSize(12);
                details.forEach(([label, value], index) => {
                    // Alternating background
                    if (index % 2 === 0) {
                        pdf.setFillColor(248, 249, 250);
                        pdf.rect(15, yPosition - 2, 180, 8, 'F');
                    }
                    
                    pdf.setFont(undefined, 'bold');
                    pdf.setTextColor(0, 0, 0);
                    pdf.text(label, 20, yPosition + 3);
                    
                    pdf.setFont(undefined, 'normal');
                    pdf.setTextColor(60, 60, 60);
                    pdf.text(value, 80, yPosition + 3);
                    
                    yPosition += 8;
                });
                
                // Footer
                yPosition += 20;
                pdf.setFillColor(230, 43, 30);
                pdf.rect(15, yPosition, 180, 25, 'F');
                
                pdf.setFontSize(16);
                pdf.setFont(undefined, 'bold');
                pdf.setTextColor(255, 255, 255);
                pdf.text('<?php echo $ticket['reference']; ?>', 105, yPosition + 8, { align: 'center' });
                
                pdf.setFontSize(10);
                pdf.text('Reference Code - Keep this safe', 105, yPosition + 18, { align: 'center' });
                
                // Instructions
                yPosition += 35;
                pdf.setFontSize(10);
                pdf.setTextColor(100, 100, 100);
                pdf.text('Instructions:', 20, yPosition);
                pdf.text('• Arrive 30 minutes before event start time', 20, yPosition + 7);
                pdf.text('• Bring valid ID along with this ticket', 20, yPosition + 14);
                pdf.text('• QR code will be scanned at entrance', 20, yPosition + 21);
                
                pdf.save(`TEDx-Dutse-Ticket-<?php echo $ticket['reference']; ?>.pdf`);
                
                overlay.style.display = 'none';
                showNotification('Enhanced PDF saved successfully!', 'success');
                
            } catch (error) {
                console.error('Error generating enhanced PDF:', error);
                overlay.style.display = 'none';
                showNotification('PDF generation failed. Please try the print option.', 'error');
            }
        }

        // Helper function to wait for all images to load
        function waitForImages() {
            return new Promise((resolve) => {
                const images = document.querySelectorAll('img');
                const imagePromises = Array.from(images).map(img => {
                    if (img.complete) {
                        return Promise.resolve();
                    }
                    return new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve; // Resolve even on error to continue
                        // Force reload if src exists but not loaded
                        if (img.src && !img.complete) {
                            const originalSrc = img.src;
                            img.src = '';
                            img.src = originalSrc;
                        }
                    });
                });
                
                Promise.all(imagePromises).then(() => {
                    // Add extra wait time for rendering
                    setTimeout(resolve, 1000);
                });
            });
        }

        // Helper function to convert image to data URL
        function imageToDataURL(img) {
            return new Promise((resolve, reject) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.naturalWidth || img.width;
                canvas.height = img.naturalHeight || img.height;
                
                // Handle CORS issues
                img.crossOrigin = 'anonymous';
                
                try {
                    ctx.drawImage(img, 0, 0);
                    const dataURL = canvas.toDataURL('image/png');
                    resolve(dataURL);
                } catch (error) {
                    console.error('Error converting image to data URL:', error);
                    // Try to load image with a fresh request
                    const freshImg = new Image();
                    freshImg.crossOrigin = 'anonymous';
                    freshImg.onload = function() {
                        try {
                            canvas.width = this.naturalWidth;
                            canvas.height = this.naturalHeight;
                            ctx.drawImage(this, 0, 0);
                            resolve(canvas.toDataURL('image/png'));
                        } catch (e) {
                            reject(e);
                        }
                    };
                    freshImg.onerror = reject;
                    freshImg.src = img.src + '?t=' + Date.now(); // Cache bust
                }
            });
        }

        // Show notification function with different types
        function showNotification(message, type) {
            const notification = document.createElement('div');
            let bgColor = '#28a745'; // success
            
            if (type === 'error') bgColor = '#dc3545';
            else if (type === 'info') bgColor = '#17a2b8';
            else if (type === 'warning') bgColor = '#ffc107';
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 1001;
                animation: slideInRight 0.3s ease;
                background: ${bgColor};
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                max-width: 300px;
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, 4000);
        }
        
        // Auto-refresh for pending payments
        <?php if ($ticket['status'] === 'pending'): ?>
        setTimeout(function() {
            location.reload();
        }, 30000);
        <?php endif; ?>
    </script>
</body>
</html>