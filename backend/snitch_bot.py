#!/usr/bin/env python3
"""
Snitch Bot - Main monitoring script for the Dead Man's Snitch.
Monitors prisoners' loyalty and exposes traitors.
"""
import os
import sys
import asyncio
import signal
import logging
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from web3 import Web3

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Import storage functions
from storage import get_prisoners, move_to_traitor, update_prisoner_baseline

# Import monitor and executioner
from monitor import get_contract, check_loyalty
from executioner import execute_blackmail

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Global flag for graceful shutdown
shutdown_requested = False

# Web3 and contract instances
w3 = None
contract = None


def signal_handler(signum, frame):
    """Handle SIGINT/SIGTERM for graceful shutdown."""
    global shutdown_requested
    sig_name = signal.Signals(signum).name
    logger.info(f"Received {sig_name}, initiating graceful shutdown...")
    shutdown_requested = True


async def setup():
    """Initialize Web3 connection and contract."""
    global w3, contract
    
    # Get Avalanche RPC URL
    rpc_url = os.getenv("AVALANCHE_RPC_URL", "https://api.avax.network/ext/bc/C/rpc")
    
    logger.info(f"Connecting to Avalanche C-Chain at {rpc_url}")
    
    try:
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        if not w3.is_connected():
            logger.error("Failed to connect to Avalanche RPC")
            sys.exit(1)
            
        logger.info(f"Connected to Avalanche C-Chain. Chain ID: {w3.eth.chain_id}")
        
        # Initialize contract
        contract = get_contract(w3)
        logger.info(f"Contract initialized at {contract.address}")
        
    except Exception as e:
        logger.error(f"Setup failed: {e}")
        sys.exit(1)


def check_betrayal(prisoner: dict, current_status: dict) -> bool:
    """
    Check if prisoner has betrayed by comparing current status with initial values.
    
    Args:
        prisoner: Prisoner data from storage
        current_status: Current loyalty status from contract
        
    Returns:
        True if betrayal detected
    """
    wallet = prisoner.get("wallet", "")
    initial_amount = int(prisoner.get("initial_amount", "0"))
    initial_multiplier = int(prisoner.get("initial_multiplier", "0"))
    
    current_amount = int(current_status.get("amount", "0"))
    current_multiplier = int(current_status.get("multiplier", "0"))
    
    # Check for unstake (amount dropped)
    if current_amount < initial_amount:
        logger.warning(
            f"BETRAYAL DETECTED: {wallet} unstaked! "
            f"Initial: {initial_amount}, Current: {current_amount}"
        )
        return True
    
    # Check for multiplier decrease
    if current_multiplier < initial_multiplier:
        logger.warning(
            f"BETRAYAL DETECTED: {wallet} multiplier dropped! "
            f"Initial: {initial_multiplier}, Current: {current_multiplier}"
        )
        return True
    
    return False


async def monitor_prisoner(prisoner: dict) -> bool:
    """
    Monitor a single prisoner for betrayal.
    
    Args:
        prisoner: Prisoner data dict
        
    Returns:
        True if prisoner was exposed as traitor
    """
    wallet = prisoner.get("wallet")
    
    if not wallet:
        logger.error("Prisoner missing wallet address")
        return False
    
    logger.info(f"Checking loyalty for {wallet}")
    
    try:
        # Check current loyalty status
        current_status = check_loyalty(wallet, w3, contract)
        
        # Check if there was an error
        if "error" in current_status:
            logger.error(f"Error checking {wallet}: {current_status['error']}")
            return False
        
        # Check if this is the first successful check (baseline not set)
        if prisoner.get("initial_amount") == "0" and prisoner.get("initial_multiplier") == "0":
            # Initialize baseline with current values
            current_amount = current_status.get("amount", "0")
            current_multiplier = current_status.get("multiplier", "0")
            update_prisoner_baseline(wallet, current_amount, current_multiplier)
            logger.info(f"Initialized baseline for {wallet} - Amount: {current_amount}, Multiplier: {current_multiplier}")
            return False
        
        # Check for betrayal
        if check_betrayal(prisoner, current_status):
            # Execute blackmail
            logger.info(f"Executing blackmail for traitor {wallet}")
            tweet_url = await execute_blackmail(prisoner)
            
            # Check if blackmail succeeded
            if tweet_url.startswith("http"):
                # Move to traitors
                try:
                    move_to_traitor(wallet, tweet_url)
                    logger.info(f"Successfully exposed traitor {wallet}: {tweet_url}")
                    return True
                except Exception as e:
                    logger.error(f"Failed to move {wallet} to traitors: {e}")
                    return False
            else:
                logger.error(f"Blackmail failed for {wallet}: {tweet_url}")
                return False
        else:
            # Still loyal
            logger.info(
                f"✓ {wallet} still loyal | "
                f"Amount: {current_status['amount']} | "
                f"Multiplier: {current_status['multiplier']}"
            )
            return False
            
    except Exception as e:
        logger.error(f"Error monitoring {wallet}: {e}")
        return False


async def monitoring_loop():
    """Main monitoring loop - runs every 30 seconds."""
    global shutdown_requested
    
    logger.info("Starting monitoring loop (30 second interval)")
    
    while not shutdown_requested:
        try:
            # Load prisoners
            prisoners = get_prisoners()
            
            if not prisoners:
                logger.info("No prisoners to monitor")
            else:
                logger.info(f"Monitoring {len(prisoners)} prisoner(s)")
                
                # Check each prisoner
                traitors_found = 0
                for prisoner in prisoners:
                    if shutdown_requested:
                        break
                        
                    is_traitor = await monitor_prisoner(prisoner)
                    if is_traitor:
                        traitors_found += 1
                    
                    # Small delay between checks to avoid rate limiting
                    await asyncio.sleep(0.5)
                
                if traitors_found > 0:
                    logger.info(f"Exposed {traitors_found} traitor(s) this cycle")
            
            # Wait for next cycle (with interruptible sleep)
            if not shutdown_requested:
                logger.debug("Sleeping for 30 seconds...")
                for _ in range(30):
                    if shutdown_requested:
                        break
                    await asyncio.sleep(1)
                    
        except Exception as e:
            logger.error(f"Error in monitoring loop: {e}")
            await asyncio.sleep(5)  # Short delay on error


async def main():
    """Main entry point."""
    logger.info("=" * 60)
    logger.info("Dead Man's Snitch - Starting up")
    logger.info("=" * 60)
    
    # Setup signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Initialize
    await setup()
    
    # Start monitoring
    try:
        await monitoring_loop()
    except asyncio.CancelledError:
        logger.info("Monitoring loop cancelled")
    
    logger.info("=" * 60)
    logger.info("Dead Man's Snitch - Shut down complete")
    logger.info("=" * 60)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)
