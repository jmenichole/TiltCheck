#!/bin/bash

# TiltCheck + QualifyFirst Development Startup
echo "🚀 Starting TiltCheck + QualifyFirst Integration"
echo "================================================"

# Start each service in background
echo "📱 Starting TiltCheck webapp (localhost:3000)..."
cd webapp && npm start &
TILTCHECK_PID=$!

echo "💰 Starting QualifyFirst platform (localhost:3001)..."  
cd ../integrations/qualifyfirst-workspace && npm run dev &
QUALIFYFIRST_PID=$!

echo "🌉 Starting Integration Bridge (localhost:3002)..."
cd ../shared && npm start &
BRIDGE_PID=$!

echo ""
echo "✅ All services starting..."
echo "   TiltCheck: http://localhost:3000"
echo "   QualifyFirst: http://localhost:3001" 
echo "   Integration: http://localhost:3002"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'kill $TILTCHECK_PID $QUALIFYFIRST_PID $BRIDGE_PID 2>/dev/null' INT
wait
