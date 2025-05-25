#!/usr/bin/env python
"""
Script to run the ESAL Platform API with uvicorn.
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
