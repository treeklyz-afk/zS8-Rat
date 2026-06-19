from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
from pydantic import BaseModel
import os
from datetime import datetime
import uuid

app = FastAPI(title="zS8 Mock UPI Gateway", version="1.0")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

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
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/health")
async def health():
    return {"status": "healthy", "time": datetime.now().isoformat()}

@app.post("/api/payment/initiate", response_model=PaymentResponse)
async def initiate_payment(payment: PaymentRequest):
    tx_id = str(uuid.uuid4())
    qr_data = f"upi://pay?pa={payment.upi_id}&am={payment.amount}&pn=zS8Mock&tr={tx_id}"
    
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
