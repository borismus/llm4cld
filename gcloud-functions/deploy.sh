#!/usr/bin/env sh
gcloud functions deploy openai_complete --runtime python311 --trigger-http --allow-unauthenticated
