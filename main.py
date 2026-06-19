from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="zS8-Rat API", version="1.0.0", description="Better API for zS8-Rat")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    name: str
    description: str = None
    price: float = 0.0

@app.get("/")
def read_root():
    return {
        "message": "✅ zS8-Rat FastAPI Backend is running on Vercel!",
        "status": "healthy",
        "version": "1.0"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "db": "connected (mock)"}

@app.post("/items/")
def create_item(item: Item):
    if not item.name:
        raise HTTPException(status_code=400, detail="Name is required")
    return {"item": item.dict(), "message": "Item created successfully"}

# Example endpoints - extend for your use case
@app.get("/status")
def get_status():
    return {"rats": "online", "active": 42, "uptime": "100%"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
