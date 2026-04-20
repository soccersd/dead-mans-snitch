"""
Executioner module - generates and posts public shaming tweets.
"""
import os
import logging
import time
from typing import Dict
import openai
import tweepy

logger = logging.getLogger(__name__)

# OpenAI client
openai_client = None

# Tweepy client
twitter_client = None


def _init_openai():
    """Initialize OpenAI client if API key is available."""
    global openai_client
    if openai_client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            openai_client = openai.OpenAI(api_key=api_key)
    return openai_client


def _init_twitter():
    """Initialize Twitter client if credentials are available."""
    global twitter_client
    if twitter_client is None:
        bearer_token = os.getenv("X_BEARER_TOKEN")
        api_key = os.getenv("X_API_KEY")
        api_secret = os.getenv("X_API_SECRET")
        access_token = os.getenv("X_ACCESS_TOKEN")
        access_secret = os.getenv("X_ACCESS_SECRET")
        
        if all([bearer_token, api_key, api_secret, access_token, access_secret]):
            twitter_client = tweepy.Client(
                bearer_token=bearer_token,
                consumer_key=api_key,
                consumer_secret=api_secret,
                access_token=access_token,
                access_token_secret=access_secret
            )
        else:
            missing = []
            if not api_key:
                missing.append("X_API_KEY")
            if not api_secret:
                missing.append("X_API_SECRET")
            if not access_token:
                missing.append("X_ACCESS_TOKEN")
            if not access_secret:
                missing.append("X_ACCESS_SECRET")
            if not bearer_token:
                missing.append("X_BEARER_TOKEN")
            logger.warning(f"Missing X credentials: {', '.join(missing)}. Twitter posting will be mocked.")
    
    return twitter_client


def _truncate_wallet(wallet: str) -> str:
    """Truncate wallet address for display."""
    if len(wallet) > 12:
        return f"{wallet[:6]}...{wallet[-4:]}"
    return wallet


def _generate_shaming_caption(wallet: str, secret: str) -> str:
    """
    Generate a savage public shaming caption using OpenAI.
    
    Args:
        wallet: Wallet address
        secret: The secret they tried to hide
        
    Returns:
        Generated caption under 280 chars
    """
    client = _init_openai()
    
    if not client:
        logger.warning("OpenAI not configured, using fallback caption")
        # Fallback caption if OpenAI is not available
        truncated = _truncate_wallet(wallet)
        return f"🚨 PAPER HAND ALERT 🚨 {truncated} betrayed HashCash and tried to hide: {secret[:50]}... Loyalty has a price, traitor. #PaperHand #HashCash"
    
    truncated_wallet = _truncate_wallet(wallet)
    
    prompt = (
        f"Generate a savage, mocking tweet exposing this person as a 'Paper Hand' "
        f"who betrayed the HashCash ecosystem. Include their wallet address ({truncated_wallet}). "
        f"The secret they tried to hide: {secret}. "
        f"Keep it under 280 characters. Be ruthless and include relevant hashtags like #PaperHand #HashCash."
    )
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a ruthless crypto snitch bot that exposes paper hands with savage mockery."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.9
        )
        
        caption = response.choices[0].message.content.strip()
        
        # Ensure under 280 chars
        if len(caption) > 280:
            caption = caption[:277] + "..."
            
        return caption
        
    except Exception as e:
        logger.error(f"OpenAI generation failed: {e}")
        # Fallback
        truncated = _truncate_wallet(wallet)
        return f"🚨 PAPER HAND ALERT 🚨 {truncated} betrayed HashCash and tried to hide: {secret[:50]}... Loyalty has a price, traitor. #PaperHand #HashCash"


def _post_tweet(caption: str) -> str:
    """
    Post tweet using Tweepy v2 Client.
    
    Args:
        caption: The tweet content
        
    Returns:
        Tweet URL on success, or raises exception
    """
    client = _init_twitter()
    
    if not client:
        # Mock posting for testing
        logger.warning("X credentials not set, returning mock tweet URL")
        mock_tweet_id = "1234567890"
        return f"https://twitter.com/i/web/status/{mock_tweet_id}"
    
    try:
        response = client.create_tweet(text=caption)
        tweet_id = response.data["id"]
        return f"https://twitter.com/i/web/status/{tweet_id}"
        
    except Exception as e:
        logger.error(f"Failed to post tweet: {e}")
        raise


async def execute_blackmail(user_data: Dict) -> str:
    """
    Execute blackmail by generating and posting a public shaming tweet.
    
    Args:
        user_data: Dict containing wallet, secret, score
        
    Returns:
        Tweet URL on success, or descriptive error string on failure
    """
    wallet = user_data.get("wallet", "")
    secret = user_data.get("secret", "")
    
    if not wallet or not secret:
        return "Error: Missing wallet or secret in user_data"
    
    # Check if X API credentials are set
    x_api_key = os.getenv("X_API_KEY")
    x_api_secret = os.getenv("X_API_SECRET")
    x_access_token = os.getenv("X_ACCESS_TOKEN")
    x_access_secret = os.getenv("X_ACCESS_SECRET")
    
    if not all([x_api_key, x_api_secret, x_access_token, x_access_secret]):
        # X credentials not set - generate mock shaming caption and fake tweet URL
        logger.info(f"[MOCK] X credentials not set, generating mock blackmail for {wallet}")
        
        # Generate mock shaming caption
        truncated = _truncate_wallet(wallet)
        mock_caption = f"🚨 PAPER HAND ALERT 🚨 {truncated} betrayed HashCash and tried to hide: {secret[:50]}... Loyalty has a price, traitor. #PaperHand #HashCash"
        
        # Generate fake tweet URL with timestamp
        mock_tweet_id = int(time.time())
        mock_tweet_url = f"https://x.com/DeadMansSnitch/status/{mock_tweet_id}"
        
        logger.info(f"[MOCK] Mock caption: {mock_caption}")
        logger.info(f"[MOCK] Mock tweet URL: {mock_tweet_url}")
        
        return mock_tweet_url
    
    try:
        # Step 1: Generate shaming caption
        logger.info(f"Generating shaming caption for {wallet}")
        caption = _generate_shaming_caption(wallet, secret)
        logger.debug(f"Generated caption: {caption}")
        
        # Step 2: Post to X
        logger.info(f"Posting tweet for {wallet}")
        tweet_url = _post_tweet(caption)
        
        logger.info(f"Successfully exposed traitor: {tweet_url}")
        return tweet_url
        
    except Exception as e:
        error_msg = f"Failed to execute blackmail: {str(e)}"
        logger.error(error_msg)
        return error_msg
