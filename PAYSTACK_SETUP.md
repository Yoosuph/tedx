# Paystack Setup Guide - Testing Phase

## Overview
This guide walks you through setting up Paystack for testing the TEDxDutse ticket system.

---

## Step 1: Create Paystack Account

1. Go to [https://dashboard.paystack.com/#/signup](https://dashboard.paystack.com/#/signup)
2. Sign up with your email (use a business email if possible)
3. Verify your email address
4. Complete the initial setup
   - You can skip business verification for testing
   - For live transactions later, you'll need:
     - BVN
     - Bank account details
     - Business registration (optional for individuals)

---

## Step 2: Get Your Test Keys

1. After logging in, click on **Settings** → **API Keys & Webhooks**
2. You'll see two sections:
   - **Test Mode** (for testing - use this now)
   - **Live Mode** (for real transactions - later)

3. Copy these keys from **Test Mode**:
   - **Public Key** (starts with `pk_test_...`)
   - **Secret Key** (starts with `sk_test_...`)

**⚠️ Important:**
- Keep your Secret Key private - never expose it in frontend code
- For now, we only need the Public Key for frontend integration
- Secret Key will be used later when we build the backend API

---

## Step 3: Configure Environment Variables

The application uses environment variables to securely manage API keys. Follow these steps:

### 3.1 Create Your .env File

```bash
cd /home/consigliere/Downloads/public_html/tedx
cp .env.example .env
```

### 3.2 Add Your Paystack Keys

Open `.env` and replace the placeholder values with your actual test keys:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_test_public_key_here
VITE_PAYSTACK_SECRET_KEY=sk_test_your_actual_test_secret_key_here
```

**⚠️ Security Best Practices:**
- ✅ Keys are loaded from `.env`, not hardcoded in source code
- ✅ `.env` is already in `.gitignore` - won't be committed to Git
- ✅ Easy to switch between test and live keys
- ✅ Different environments can have different `.env` files
- ❌ Never share your Secret Key or commit it to version control

### 3.3 Restart Development Server

Environment variables are loaded at build time, so restart your dev server:

```bash
# Stop the server (Ctrl+C) then restart:
npm run dev
```

The code now automatically reads `VITE_PAYSTACK_PUBLIC_KEY` from your environment. If the key is missing or invalid, you'll see a console error in the browser.

---

## Step 4: Test the Payment Flow

### 4.1 Start Development Server

```bash
cd /home/consigliere/Downloads/public_html/tedx
npm run dev
```

### 4.2 Navigate to Tickets Page

Open: `http://localhost:5173/tickets`

### 4.3 Test Payment Process

1. **Select a ticket tier** (Regular, VIP, or VVIP)
2. **Fill the form:**
   - Name: Test User
   - Email: test@example.com
   - Phone: +234 800 000 0000

3. **Click "Pay with Paystack"**
   - Paystack modal will open
   - Choose payment method

### 4.4 Use Test Card Details

**Successful Payment:**
```
Card Number: 4084 0840 8408 4081
CVV: 408
Expiry: 06/2026
PIN: 4084
```

**Failed Payment (for testing error handling):**
```
Card Number: 4084 0840 8408 4081
CVV: 408
Expiry: 06/2026
PIN: 1234 (wrong PIN)
```

### 4.5 Verify Payment Success

After successful payment:
1. You'll be redirected to `/tickets/verify?reference=...`
2. QR code will be generated
3. Ticket will be saved to localStorage
4. You can download the QR code or view the ticket

---

## Step 5: Test Admin Features

### 5.1 Access Admin Dashboard

Navigate to: `http://localhost:5173/admin/tickets`

You should see:
- Your test ticket in the list
- Stats showing 1 ticket sold
- Revenue matching the ticket price

### 5.2 Test QR Scanner

1. Go to `/admin/tickets/scanner`
2. Allow camera access
3. Scan the QR code from your test ticket
4. Verify it shows ticket details
5. Click "Check In" to mark as used

### 5.3 Test Manual Verification

1. Go to `/admin/tickets/verify`
2. Enter the ticket reference from your test purchase
3. Verify it shows correct details

---

## Step 6: Test Edge Cases

### 6.1 Payment Cancellation
- Start payment, then close the modal
- Should show error: "Payment cancelled"

### 6.2 Duplicate Purchase
- Try buying another ticket with the same email
- Should work (Paystack doesn't prevent duplicates)
- Both tickets should appear in admin dashboard

### 6.3 Ticket Recovery
- Go to `/tickets/recover`
- Enter the email used for purchase
- Should show all tickets for that email

---

## Step 7: View Transactions in Paystack Dashboard

1. Go back to [Paystack Dashboard](https://dashboard.paystack.com)
2. Click on **Transactions** in the sidebar
3. You'll see all test transactions
4. Click on any transaction to see details
5. Verify the metadata (name, phone, ticket tier) is captured

---

## Step 8: Test Webhook (Optional - for backend integration later)

If you want to test webhook callbacks (for future backend integration):

1. Install ngrok for local webhook testing:
```bash
npm install -g ngrok
```

2. Start ngrok:
```bash
ngrok http 5173
```

3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

4. In Paystack Dashboard:
   - Go to **Settings** → **API Keys & Webhooks**
   - Scroll to **Webhook URLs**
   - Add Test Webhook URL: `https://abc123.ngrok.io/api/webhook/paystack`

5. Make a test payment and check if webhook is received

---

## Step 9: Troubleshooting

### Common Issues

**"Invalid key" error:**
- Make sure you're using test keys, not live keys
- Check for typos in the key
- Ensure key starts with `pk_test_`

**Payment modal doesn't open:**
- Check browser console for errors
- Verify public key is correctly set
- Ensure you're on localhost or HTTPS (not HTTP)

**"Email already exists" error:**
- Paystack might have this email from previous tests
- Use a different email or clear Paystack test data

**Redirect not working:**
- Check `onSuccess` callback in `TicketsPage.jsx`
- Verify the redirect URL is correct
- Check browser console for errors

---

## Step 10: Test Scenarios Checklist

Use this checklist to verify everything works:

- [ ] Can select ticket tier
- [ ] Form validation works (all fields required, email format)
- [ ] Paystack modal opens with correct amount
- [ ] Successful payment redirects to verification page
- [ ] QR code is generated and downloadable
- [ ] Ticket appears in admin dashboard
- [ ] Can search for ticket by email/reference
- [ ] QR scanner works and shows ticket details
- [ ] Can mark ticket as checked in
- [ ] Manual verification works
- [ ] Payment cancellation shows error
- [ ] Transaction appears in Paystack dashboard

---

## Next Steps: Live Mode (After Testing)

Once you're satisfied with testing and ready to go live:

1. **Complete Paystack verification:**
   - Submit business documents
   - Wait for approval (usually 24-48 hours)

2. **Switch to live keys:**
   - Replace `pk_test_` with `pk_live_` in your code
   - Use real payment methods (real cards, bank transfers)

3. **Set up backend API:**
   - Use Secret Key to verify transactions server-side
   - Implement webhook handler for payment notifications
   - Store tickets in database instead of localStorage

4. **Configure callback URLs:**
   - Update Paystack dashboard with production URLs
   - Set up webhook endpoint for live mode

---

## Resources

- [Paystack Documentation](https://paystack.com/docs/)
- [React Paystack Package](https://www.npmjs.com/package/react-paystack)
- [Test Card Numbers](https://paystack.com/docs/payments/test-payments)
- [Paystack Support](https://paystack.com/help)

---

## Questions?

If you encounter any issues:
1. Check browser console for errors
2. Verify your test keys are correct
3. Review Paystack dashboard for transaction details
4. Check the troubleshooting section above

Ready to test? Let me know if you need help with any step!
