from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
from pydantic import BaseModel
from datetime import datetime
import uuid

app = FastAPI(title="zS8 Mock UPI Gateway", version="1.0")

# Mount static files if directory exists
try:
    app.mount("/static", StaticFiles(directory="static"), name="static")
except:
    pass  # Static dir may not be needed for inline HTML

class PaymentRequest(BaseModel):
    amount: float
    upi_id: str
    note: str = ""

class PaymentResponse(BaseModel):
    transaction_id: str
    qr_code: str
    status: str
    message: str

@app.get("/", response_class=HTMLResponse)
async def home_dashboard(request: Request):
    # Inline HTML for better Vercel compatibility (no Jinja2 dependency issues)
    html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>zS8 Mock UPI Gateway</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        body { font-family: 'Inter', system-ui, sans-serif; }
        .dark { background-color: #0a0a0a; color: #e5e5e5; }
    </style>
</head>
<body class="dark bg-zinc-950 text-zinc-100 min-h-screen">
    <div class="max-w-7xl mx-auto p-8">
        <!-- Header -->
        <div class="flex justify-between items-center mb-12">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-xl font-bold">₹</div>
                <div>
                    <h1 class="text-4xl font-semibold tracking-tight">zS8 Mock UPI</h1>
                    <p class="text-zinc-400">Professional Payment Gateway Simulator</p>
                </div>
            </div>
            <div class="flex items-center gap-6 text-sm">
                <a href="/docs" target="_blank" class="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-2xl transition">API Docs</a>
                <div class="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-2xl text-xs font-medium">LIVE</div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Main Dashboard -->
            <div class="lg:col-span-8 space-y-8">
                <!-- Payment Form -->
                <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                    <h2 class="text-2xl font-semibold mb-6">Initiate Payment</h2>
                    <form id="paymentForm" class="space-y-6">
                        <div>
                            <label class="block text-sm text-zinc-400 mb-2">Amount (₹)</label>
                            <input type="number" id="amount" value="499" step="0.01" 
                                   class="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-2xl focus:outline-none focus:border-emerald-500">
                        </div>
                        <div>
                            <label class="block text-sm text-zinc-400 mb-2">UPI ID</label>
                            <input type="text" id="upi" value="user@mockupi" 
                                   class="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500">
                        </div>
                        <div>
                            <label class="block text-sm text-zinc-400 mb-2">Note (Optional)</label>
                            <input type="text" id="note" value="Test payment" 
                                   class="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500">
                        </div>
                        <button type="submit"
                                class="w-full bg-emerald-500 hover:bg-emerald-600 py-5 rounded-2xl text-xl font-semibold transition">
                            Generate QR & Initiate Payment
                        </button>
                    </form>
                </div>

                <!-- Recent Transactions -->
                <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                    <h2 class="text-2xl font-semibold mb-6">Recent Transactions</h2>
                    <div id="transactions" class="space-y-4">
                        <!-- JS populated -->
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="lg:col-span-4 space-y-6">
                <!-- Guide -->
                <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                    <h3 class="text-xl font-semibold mb-4">How to Use</h3>
                    <div class="space-y-6 text-sm">
                        <div class="flex gap-4">
                            <div class="w-8 h-8 bg-zinc-800 rounded-2xl flex items-center justify-center text-emerald-400 font-mono">1</div>
                            <div>Enter amount and UPI ID</div>
                        </div>
                        <div class="flex gap-4">
                            <div class="w-8 h-8 bg-zinc-800 rounded-2xl flex items-center justify-center text-emerald-400 font-mono">2</div>
                            <div>Click "Generate QR"</div>
                        </div>
                        <div class="flex gap-4">
                            <div class="w-8 h-8 bg-zinc-800 rounded-2xl flex items-center justify-center text-emerald-400 font-mono">3</div>
                            <div>Scan with any UPI app (PhonePe, GPay, etc.)</div>
                        </div>
                        <div class="flex gap-4">
                            <div class="w-8 h-8 bg-zinc-800 rounded-2xl flex items-center justify-center text-emerald-400 font-mono">4</div>
                            <div>Check status instantly</div>
                        </div>
                    </div>
                </div>

                <!-- API Endpoints -->
                <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                    <h3 class="text-xl font-semibold mb-4">Quick API Guide</h3>
                    <div class="space-y-3 text-xs font-mono">
                        <div class="bg-zinc-950 p-4 rounded-2xl">
                            <span class="text-emerald-400">POST</span> /api/payment/initiate
                        </div>
                        <div class="bg-zinc-950 p-4 rounded-2xl">
                            <span class="text-emerald-400">GET</span> /api/payment/status/{tx_id}
                        </div>
                    </div>
                    <a href="/docs" target="_blank" 
                       class="block mt-6 text-center text-emerald-400 hover:text-emerald-300 text-sm">
                        View Full Interactive Docs →
                    </a>
                </div>
            </div>
        </div>
    </div>

    <script>
        const form = document.getElementById('paymentForm');
        const transactionsDiv = document.getElementById('transactions');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const amount = parseFloat(document.getElementById('amount').value);
            const upi = document.getElementById('upi').value;
            const note = document.getElementById('note').value;

            try {
                const res = await fetch('/api/payment/initiate', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({amount, upi_id: upi, note})
                });
                
                const data = await res.json();
                
                alert(`✅ Payment Initiated!\n\nTransaction ID: ${data.transaction_id}\n\nQR Data: ${data.qr_code}\n\nStatus: ${data.status}`);
                
                const txHTML = `
                    <div class="flex justify-between items-center bg-zinc-950 p-4 rounded-2xl">
                        <div>
                            <div class="font-medium">₹${amount}</div>
                            <div class="text-xs text-zinc-500">${upi}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-emerald-400 text-sm font-medium">${data.status}</div>
                            <div class="text-[10px] text-zinc-500">${new Date().toLocaleTimeString()}</div>
                        </div>
                    </div>`;
                transactionsDiv.innerHTML = txHTML + transactionsDiv.innerHTML;
            } catch (err) {
                alert('Error: ' + err.message);
            }
        });

        // Initial demo transaction
        transactionsDiv.innerHTML = `
            <div class="flex justify-between items-center bg-zinc-950 p-4 rounded-2xl">
                <div>
                    <div class="font-medium">₹299</div>
                    <div class="text-xs text-zinc-500">demo@okaxis</div>
                </div>
                <div class="text-right">
                    <div class="text-emerald-400 text-sm font-medium">success</div>
                    <div class="text-[10px] text-zinc-500">2 min ago</div>
                </div>
            </div>`;
    </script>
</body>
</html>
    """
    return HTMLResponse(content=html_content)

@app.get("/health")
async def health():
    return {"status": "healthy", "time": datetime.now().isoformat()}

@app.post("/api/payment/initiate", response_model=PaymentResponse)
async def initiate_payment(payment: PaymentRequest):
    tx_id = str(uuid.uuid4())
    qr_data = f"upi://pay?pa={payment.upi_id}&am={payment.amount}&pn=MockMerchant&tr={tx_id}"
    
    return PaymentResponse(
        transaction_id=tx_id,
        qr_code=qr_data,
        status="pending",
        message="Payment initiated. Scan QR to pay."
    )

@app.get("/api/payment/status/{tx_id}")
async def payment_status(tx_id: str):
    return {
        "transaction_id": tx_id,
        "status": "success",
        "amount": 499.0,
        "message": "Payment successful"
    }

@app.get("/docs")
async def docs_redirect():
    return {"message": "Swagger docs available at /docs"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
