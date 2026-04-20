import os
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from judge import judge_shame
from storage import (
    add_prisoner,
    get_prisoners,
    get_traitors,
    move_to_traitor
)

# Load environment variables
load_dotenv()


class JudgeRequest(BaseModel):
    content: str
    wallet_address: str


class LockRequest(BaseModel):
    wallet_address: str
    secret: str
    score: int


class MoveToTraitorRequest(BaseModel):
    wallet_address: str
    tweet_url: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    if not os.getenv("OPENAI_API_KEY"):
        print("INFO: OPENAI_API_KEY not set. Using local scoring (live demo mode).")
    yield
    # Shutdown


app = FastAPI(
    title="The Dead Man's Snitch - Backend",
    description="Backend API for The Dead Man's Snitch hackathon project",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for all origins (hackathon project)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/judge")
async def judge_endpoint(request: JudgeRequest):
    """
    Judge the shame level of a secret.
    
    Returns the score, message from The Judge of Shame, and whether it's accepted.
    """
    try:
        result = await judge_shame(request.content)
        return {
            "wallet_address": request.wallet_address,
            **result
        }
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.get("/status")
async def status_endpoint():
    """
    Get current status of all prisoners and traitors.
    
    Prisoner secrets are stripped for privacy.
    """
    try:
        prisoners = get_prisoners(strip_secrets=True)
        traitors = get_traitors()
        return {
            "prisoners": prisoners,
            "traitors": traitors
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.post("/lock")
async def lock_endpoint(request: LockRequest):
    """
    Lock a secret as a prisoner.
    
    Only accepts if score >= 60.
    """
    if request.score < 60:
        raise HTTPException(
            status_code=400,
            detail="Score must be at least 60 to lock a secret"
        )
    
    try:
        prisoner = add_prisoner(
            wallet=request.wallet_address,
            secret=request.secret,
            score=request.score
        )
        return {
            "success": True,
            "prisoner": {
                "wallet": prisoner["wallet"],
                "score": prisoner["score"],
                "locked_at": prisoner["locked_at"]
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.post("/expose")
async def expose_endpoint(request: MoveToTraitorRequest):
    """
    Move a prisoner to traitors (exposed).
    
    This is called when a prisoner fails to pay and their secret is tweeted.
    """
    try:
        traitor = move_to_traitor(
            wallet=request.wallet_address,
            tweet_url=request.tweet_url
        )
        return {
            "success": True,
            "traitor": traitor
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
