import os
import requests

def generate_ai_insights(prompt: str) -> str:
    """
    Calls the Groq API securely from the backend to generate descriptive text based on simulation limits.
    """
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        print("Warning: GROQ_API_KEY is missing. AI Insights will return fallback.")
        return "AI insights are currently unavailable."

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {groq_api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "You are 'Future You', an expert behavioral predictor and strategic life analyst. Provide concise, direct insights."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.5,
        "max_tokens": 512
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return "An error occurred generating AI insights. Please try again later."
