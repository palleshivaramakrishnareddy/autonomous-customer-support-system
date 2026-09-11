import os
import json
import re
from typing import Dict, Any, Optional, List
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

def get_ai_mode() -> str:
    return "OPENAI" if (OPENAI_API_KEY and len(OPENAI_API_KEY) > 10) else "FALLBACK"

def call_openai_structured(prompt: str, system_message: str, schema: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    mode = get_ai_mode()
    if mode != "OPENAI":
        return None
    
    try:
        client = OpenAI(api_key=OPENAI_API_KEY, timeout=10.0)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"{system_message}\nYou MUST respond with valid JSON matching this schema:\n{json.dumps(schema)}"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"[AI Service Warning] OpenAI call failed, falling back to deterministic engine: {e}")
        return None
