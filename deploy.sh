#!/bin/bash

# Deploy script for Tower of Hanoi to GCP Cloud Run
# Usage: ./deploy.sh

set -e  # Exit on error

# Configuration
REGION="us-west1"
SERVICE_NAME="tower-hanoi"
MEMORY="512Mi"
CPU="1"
MAX_INSTANCES="1"

# Get project ID from gcloud config
PROJECT_ID=$(gcloud config get-value project)

if [ -z "$PROJECT_ID" ]; then
    echo "Error: No GCP project set. Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "==================================="
echo "Deploying Tower of Hanoi"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "==================================="

# Build Docker image for AMD64 (required by Cloud Run)
echo "Building Docker image..."
docker build --platform linux/amd64 -t gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest .

# Push to Google Container Registry
echo "Pushing image to GCR..."
docker push gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory ${MEMORY} \
  --cpu ${CPU} \
  --max-instances ${MAX_INSTANCES} \
  --platform managed

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

echo "==================================="
echo "Deployment complete!"
echo "Service URL: $SERVICE_URL"
echo "==================================="
