"""
Moats contract monitor for checking prisoner loyalty status.
"""
import os
import time
from typing import Dict, Optional
from web3 import Web3

# Moats contract address (from env var)
MOATS_CONTRACT = "0x61fB5760882798fF7C934E8f74a0980A1Bc06D76"

# Partial ABI - only view functions needed
MOATS_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "user", "type": "address"}
        ],
        "name": "getUserInfo",
        "outputs": [
            {"internalType": "uint256", "name": "amount", "type": "uint256"},
            {"internalType": "uint256", "name": "lockEndTime", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "user", "type": "address"}
        ],
        "name": "getMultiplier",
        "outputs": [
            {"internalType": "uint256", "name": "multiplier", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]


def get_contract(w3: Web3) -> object:
    """
    Instantiate the Moats contract with the partial ABI.
    
    Args:
        w3: Web3 instance connected to Avalanche C-Chain
        
    Returns:
        Contract instance for calling read functions
    """
    contract_address = os.getenv("MOATS_CONTRACT") or MOATS_CONTRACT
    # Ensure proper checksum
    contract_address = Web3.to_checksum_address(contract_address)
    return w3.eth.contract(address=contract_address, abi=MOATS_ABI)


def check_loyalty(wallet_address: str, w3: Optional[Web3], contract) -> Dict:
    """
    Check loyalty status of a wallet by calling Moats contract.
    
    Args:
        wallet_address: The wallet address to check
        w3: Web3 instance (can be None if no RPC URL configured)
        contract: Moats contract instance from get_contract() (can be None)
        
    Returns:
        Dict with wallet, amount, lock_end_time, multiplier, is_loyal
    """
    # Check if AVALANCHE_RPC_URL is set and valid
    rpc_url = os.getenv("AVALANCHE_RPC_URL")
    if not rpc_url or w3 is None or contract is None:
        # Return mock loyalty data when blockchain is not configured
        return {
            "wallet": wallet_address,
            "amount": "1000000000000000000",
            "lock_end_time": int(time.time()) + 86400 * 30,
            "multiplier": "1500",
            "is_loyal": True
        }
    
    # Normalize wallet address
    wallet = Web3.to_checksum_address(wallet_address)
    
    try:
        # Call getUserInfo - returns (amount, lockEndTime)
        user_info = contract.functions.getUserInfo(wallet).call()
        amount = user_info[0]  # uint256 amount
        lock_end_time = user_info[1]  # uint256 lockEndTime
        
        # Call getMultiplier - returns uint256
        multiplier = contract.functions.getMultiplier(wallet).call()
        
        # Determine loyalty status
        # is_loyal = True if amount > 0 and multiplier hasn't dropped to 0
        is_loyal = amount > 0 and multiplier > 0
        
        return {
            "wallet": wallet_address,
            "amount": str(amount),
            "lock_end_time": lock_end_time,
            "multiplier": str(multiplier),
            "is_loyal": is_loyal
        }
        
    except Exception as e:
        # Return error state with zero values
        return {
            "wallet": wallet_address,
            "amount": "0",
            "lock_end_time": 0,
            "multiplier": "0",
            "is_loyal": False,
            "error": str(e)
        }
