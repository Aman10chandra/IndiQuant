#!/bin/bash
if [ -d "backend" ]; then
  cd backend && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
else
  uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
fi
