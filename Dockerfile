FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY main.py app.py ./
COPY index.html three-ui.html ./
COPY script.js three-ui.js styles.css ./

# Cloud Run sets PORT environment variable
ENV PORT=8080

# Run the FastAPI app with uvicorn
# Cloud Run requires binding to 0.0.0.0 and the PORT env var
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
