"""
AI client implementation for the ESAL Platform.
"""
from typing import Any, Dict, List, Optional
import json
import os
import httpx
from pydantic import BaseModel, Field

class GeminiOptions(BaseModel):
    """Options for Gemini API requests."""
    temperature: float = Field(default=0.7, ge=0, le=1)
    top_p: float = Field(default=0.95, ge=0, le=1)
    top_k: int = Field(default=40, ge=0)
    max_output_tokens: int = Field(default=2048, ge=0)
    stop_sequences: List[str] = Field(default_factory=list)

class GeminiClient:
    """Client for interacting with Google's Gemini AI API."""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("Gemini API key is required")
        
        self.base_url = "https://generativelanguage.googleapis.com/v1"
        self.client = httpx.AsyncClient(timeout=60.0)
        
    async def generate_text(self, prompt: str, options: Optional[GeminiOptions] = None) -> str:
        """
        Generate text using the Gemini API.
        
        Args:
            prompt: The input prompt for the model
            options: Optional configuration for the request
            
        Returns:
            Generated text response
        """
        options = options or GeminiOptions()
        
        url = f"{self.base_url}/models/gemini-2.0-flash:generateContent?key={self.api_key}"
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": options.temperature,
                "topP": options.top_p,
                "topK": options.top_k,
                "maxOutputTokens": options.max_output_tokens,
                "stopSequences": options.stop_sequences
            }
        }
        
        try:
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            
            data = response.json()
            if "candidates" in data and data["candidates"]:
                return data["candidates"][0]["content"]["parts"][0]["text"]
            return ""
        except httpx.HTTPError as e:
            # In production, this should be logged properly
            print(f"Error calling Gemini API: {e}")
            return ""

class OpenAIClient:
    """Client for interacting with OpenAI API."""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        
        self.client = httpx.AsyncClient(timeout=60.0)
        self.base_url = "https://api.openai.com/v1"
        
    async def generate_response(self, prompt: str, options: Dict[str, Any] = None) -> str:
        """
        Generate a response from the OpenAI model based on the prompt.
        
        Args:
            prompt: The input prompt for the model
            options: Optional configuration for the request
            
        Returns:
            Generated text response
        """
        options = options or {}
        
        url = f"{self.base_url}/chat/completions"
        
        payload = {
            "model": options.get("model", "gpt-4o"),
            "messages": [{"role": "user", "content": prompt}],
            "temperature": options.get("temperature", 0.7),
            "max_tokens": options.get("max_tokens", 1024)
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            response = await self.client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except httpx.HTTPError as e:
            # In production, this should be logged properly
            print(f"Error calling OpenAI API: {e}")
            return ""