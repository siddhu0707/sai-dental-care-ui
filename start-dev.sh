#!/bin/bash

# Start JSON server in background
echo "Starting JSON Server on port 3001..."
npm run json-server &

# Wait a moment for JSON server to start
sleep 3

# Start Angular dev server
echo "Starting Angular dev server on port 4200..."
npm start

# Kill JSON server when Angular dev server stops
trap 'kill $(jobs -p)' EXIT
