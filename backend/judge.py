import os
import json
import random
from typing import Dict
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

# OpenAI client - initialized only if API key is set
client = None
if os.getenv("OPENAI_API_KEY"):
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Local scoring messages
LOW_SCORE_MESSAGES = [
    "Pathetic. My grandmother has darker secrets than this garbage.",
    "Is this a joke? Even a toddler would be ashamed of how WEAK this secret is.",
    "You call THIS a secret? I've seen more scandalous grocery lists.",
    "Weak. Embarrassingly weak. Come back when you have something REAL to confess."
]

HIGH_SCORE_MESSAGES = [
    "Now we're talking. This secret has teeth. Welcome to the vault, prisoner.",
    "Deliciously shameful. Your secret is locked. Betray us, and the world will know.",
    "The vault accepts your shame. You're bound now. There is no escape.",
    "A worthy confession. The Dead Man's Snitch holds your fate."
]

# Keywords that increase shame score
SHAME_KEYWORDS = ["secret", "shame", "cheat", "steal", "lie", "betray", "drunk", "fired", "arrested", "hack", "scam", "rug", "dump", "fake", "fraud"]

SYSTEM_PROMPT = """You are "The Judge of Shame," a cruel, merciless arbiter of secrets.

Analyze the submitted secret and assign a Shame Score from 0 to 100 based on how embarrassing, damaging, or scandalous it would be if exposed publicly.

Respond ONLY in JSON format:
{"score": int, "message": str}

If score <= 60:
- Your message should be toxic, insulting, mocking the user for having a weak, pathetic secret.
- Be cruel and dismissive. Make them feel ashamed for wasting your time.

If score >= 60:
- Your message should be cold, menacing, confirming the secret is worthy and will be held over them.
- Speak with authority and menace. They have just put themselves in your power.

Do not include any other text outside the JSON."""


def _calculate_local_score(content: str) -> int:
    """Calculate a shame score based on content length and keywords."""
    # Base score from content length
    score = min(len(content) * 1.5, 60)
    
    # Add points for shame keywords
    content_lower = content.lower()
    for keyword in SHAME_KEYWORDS:
        if keyword in content_lower:
            score += 10
    
    # Cap at 100
    return min(int(score), 100)


def _get_local_message(score: int, content: str) -> str:
    """Get a message based on score, seeded for consistency."""
    # Seed random with content hash for consistency
    random.seed(hash(content))
    
    if score <= 60:
        message = random.choice(LOW_SCORE_MESSAGES)
    else:
        message = random.choice(HIGH_SCORE_MESSAGES)
    
    # Reset random seed
    random.seed()
    return message


async def judge_shame(content: str) -> Dict:
    """
    Judge the shame level of a secret using OpenAI or local scoring.
    
    Args:
        content: The secret content to judge
        
    Returns:
        Dict with keys: score (int), message (str), accepted (bool)
    """
    # If no OpenAI API key, use local scoring as default behavior
    if not os.getenv("OPENAI_API_KEY") or client is None:
        score = _calculate_local_score(content)
        message = _get_local_message(score, content)
        return {
            "score": score,
            "message": message,
            "accepted": score >= 60
        }
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Judge this secret: {content}"}
            ],
            temperature=0.8,
            max_tokens=300
        )
        
        result_text = response.choices[0].message.content.strip()
        
        # Extract JSON from response (handle potential markdown code blocks)
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(result_text)
        
        # Validate required fields
        if "score" not in result or "message" not in result:
            raise ValueError("Invalid response format from OpenAI")
        
        score = int(result["score"])
        score = max(0, min(100, score))  # Clamp to 0-100
        
        return {
            "score": score,
            "message": result["message"],
            "accepted": score >= 60
        }
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse OpenAI response: {e}")
    except Exception as e:
        raise ValueError(f"Error judging shame: {e}")
