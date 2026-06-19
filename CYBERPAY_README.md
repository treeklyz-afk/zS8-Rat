# CyberPay System - Payment Gateway Backend

A powerful, API-first payment gateway system built with FastAPI-inspired tRPC architecture, supporting UPI Intent, PhonePe Merchant ID, and Static QR Code payment methods. Designed for seamless integration with external applications.

## 🚀 Features

### Payment Gateway
- **Multi-Method Support**: UPI Intent, PhonePe Merchant ID, and Static QR Code payments
- **Smart Auto-Routing**: Intelligent payment method selection based on configuration
- **Dynamic QR Codes**: Auto-generated QR codes for UPI transactions with amount and reference ID
- **Transaction Ledger**: Complete transaction history with status tracking
- **Secure Storage**: S3-backed storage for static QR code images with persistent URLs

### Admin Panel
- **Payment Configuration**: Switch between payment methods and manage credentials
- **UPI Management**: Configure UPI ID for direct UPI Intent payments
- **PhonePe Integration**: Set up PhonePe Merchant ID for merchant payments
- **QR Code Upload**: Upload and manage static QR code images
- **Transaction Management**: View all transactions and update their status in real-time
- **Owner Notifications**: Real-time alerts on payment initiation and status changes

### API Endpoints
All endpoints are accessible via tRPC at `/api/trpc/`:

**Public Endpoints:**
- `payment.getConfig` - Retrieve current payment configuration
- `payment.initiatePayment` - Initiate a new payment transaction
- `payment.verifyTransaction` - Verify transaction status by reference ID

**Admin Endpoints (Owner-Only):**
- `payment.updateConfig` - Update payment configuration
- `payment.getTransactions` - Retrieve all transactions with pagination
- `payment.updateTransactionStatus` - Update transaction status
- `qrcode.uploadQrCode` - Upload static QR code image
- `qrcode.getActiveQrCode` - Get active QR code details

## 🎨 UI & Design

### Home Page
- Dark cyberpunk aesthetic with neon accents (cyan, purple, pink)
- API documentation and endpoint reference
- Feature overview cards
- Quick-start guide for external app integration
- Responsive mobile-first design

### Admin Panel
- Sticky header with admin controls
- Payment method configuration section
- Current status display with real-time updates
- Transaction ledger with status management
- QR code upload dialog with preview
- Responsive layout optimized for mobile and desktop

## 📊 Database Schema

### Tables
- **users** - User accounts with role-based access control
- **payment_config** - Active payment method and credentials
- **transactions** - Payment transaction records with status
- **qr_codes** - Uploaded QR code metadata and storage URLs
- **notifications** - Owner notification history

## 🔐 Security

- **Role-Based Access Control**: Admin-only access to configuration and management endpoints
- **Secure File Storage**: QR code images stored in S3 with secure URLs
- **Transaction Logging**: All transactions logged with timestamps and reference IDs
- **Owner Notifications**: Real-time alerts for all payment events
- **Input Validation**: All inputs validated with Zod schemas

## 🚀 Quick Start

### For External App Integration

**1. Initiate Payment:**
```javascript
const response = await fetch('/api/trpc/payment.initiatePayment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 99.99,
    description: 'Product purchase',
    externalAppId: 'your-app-id',
    metadata: { orderId: '12345' }
  })
});
const data = await response.json();
console.log(data.result.data);
// Returns: { referenceId, amount, paymentMethod, upiDeepLink, qrCodeUrl, status }
```

**2. Verify Transaction:**
```javascript
const response = await fetch(
  '/api/trpc/payment.verifyTransaction?input=' + 
  JSON.stringify({ referenceId: 'TXN_...' })
);
const data = await response.json();
console.log(data.result.data.status); // 'initiated', 'pending', 'completed', 'failed'
```

**3. Get Configuration:**
```javascript
const response = await fetch('/api/trpc/payment.getConfig');
const config = await response.json();
console.log(config.result.data);
// Returns: { activeMethod, upiId, merchantName, phonepeMerchantId, staticQrUrl }
```

### For Admin Management

**Access Admin Panel:**
1. Navigate to `/admin`
2. Sign in with your owner account
3. Configure payment method and credentials
4. Upload static QR code (if using static_qr method)
5. View and manage transactions in real-time

## 🔄 Payment Flow

### UPI Intent Flow
1. Admin configures UPI ID and sets `activeMethod` to `upi_intent`
2. External app calls `payment.initiatePayment` with amount
3. System generates UPI deep-link: `upi://pay?pa=merchant@upi&am=100&...`
4. System generates dynamic QR code from deep-link
5. User scans QR or clicks deep-link to pay
6. External app polls `payment.verifyTransaction` to check status

### PhonePe Merchant Flow
1. Admin configures PhonePe Merchant ID and sets `activeMethod` to `phonepe_merchant`
2. External app calls `payment.initiatePayment` with amount
3. System returns merchant ID for PhonePe integration
4. External app handles PhonePe payment flow
5. External app updates transaction status via `payment.updateTransactionStatus`

### Static QR Flow
1. Admin uploads static QR code image via admin panel
2. Admin sets `activeMethod` to `static_qr`
3. External app calls `payment.initiatePayment` with amount
4. System returns persistent URL to static QR image
5. User scans QR code to pay (amount shown separately in app)
6. External app updates transaction status after payment

## 📱 Mobile Responsiveness

- **Mobile-First Design**: Optimized for all screen sizes
- **Touch-Friendly**: Large tap targets and easy navigation
- **Bottom Navigation**: Quick access to key functions on mobile
- **Responsive Tables**: Horizontal scroll on small screens
- **Adaptive Dialogs**: Optimized dialog layouts for mobile

## 🔔 Real-Time Notifications

The system sends owner notifications for:
- **Payment Initiated**: When a new payment is initiated
- **Status Updated**: When transaction status changes
- **Config Updated**: When payment configuration is modified
- **QR Uploaded**: When a new QR code is uploaded

Notifications are delivered in real-time to the owner's Manus account.

## 🛠️ Technology Stack

- **Frontend**: React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11 + Drizzle ORM
- **Database**: MySQL/TiDB
- **Storage**: AWS S3 (via Manus storage proxy)
- **Authentication**: Manus OAuth
- **QR Generation**: qrcode library
- **Notifications**: Manus notification system

## 📝 Environment Variables

Pre-configured system environment variables (no manual setup required):
- `DATABASE_URL` - MySQL/TiDB connection string
- `JWT_SECRET` - Session cookie signing secret
- `VITE_APP_ID` - Manus OAuth application ID
- `OAUTH_SERVER_URL` - Manus OAuth backend URL
- `BUILT_IN_FORGE_API_URL` - Manus built-in APIs endpoint
- `BUILT_IN_FORGE_API_KEY` - Manus API authentication key

## 🧪 Testing

The system includes comprehensive tRPC procedures that can be tested via:
1. Direct API calls from external applications
2. Admin panel UI interactions
3. tRPC client hooks in React components

All endpoints are fully typed with TypeScript and Zod validation.

## 📦 Deployment

The system is ready for deployment on Manus hosting:
1. All code is production-ready
2. Database migrations are applied
3. S3 storage is configured
4. Owner notifications are integrated
5. Admin authentication is enforced

Click the **Publish** button in the Management UI to deploy.

## 🎯 Next Steps

1. **Configure Payment Method**: Go to `/admin` and set up your preferred payment method
2. **Upload QR Code** (if using static_qr): Upload your QR code image
3. **Test Integration**: Use the Quick Start examples to test the API
4. **Monitor Transactions**: View all transactions in the admin panel
5. **Deploy**: Click Publish to make your payment gateway live

## 📞 Support

For issues or questions:
- Check the API documentation on the home page
- Review transaction logs in the admin panel
- Check owner notifications for system alerts

---

**CyberPay System** - Built for seamless payment integration with external applications.
