#!/bin/bash
# Build script for Vercel deployment
# This script ensures the UI package is built before building the specific app

set -e

echo "Installing dependencies..."
cd ../..
pnpm install

echo "Building UI package..."
pnpm --filter @esal/ui run build

echo "Building app..."
if [ "$1" = "landing" ]; then
    pnpm --filter landing run build
elif [ "$1" = "innovator-portal" ]; then
    pnpm --filter innovator-portal run build
elif [ "$1" = "investor-portal" ]; then
    pnpm --filter investor-portal run build
elif [ "$1" = "hub-portal" ]; then
    pnpm --filter hub-portal run build
elif [ "$1" = "admin-portal" ]; then
    pnpm --filter admin-portal run build
else
    echo "Unknown app: $1"
    exit 1
fi

echo "Build completed successfully!"
