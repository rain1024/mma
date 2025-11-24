#!/bin/bash

API_BASE_URL="http://localhost:4000/api"

echo "Creating promotions via REST API..."
echo ""

# Create Lion Championship
echo "Creating Lion Championship..."
curl -X POST "${API_BASE_URL}/promotions" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "lion",
    "name": "LION CHAMPIONSHIP",
    "subtitle": "Vietnam'\''s Premier Mixed Martial Arts Promotion",
    "theme": "lion-theme",
    "color": "#ff8c00",
    "events": [
      "lc10", "lc5", "lc28", "lc27", "lc26", "lc25", "lc24", "lc23",
      "lc22", "lc21", "lc20", "lc19", "lc18", "lc17", "lc16", "lc15",
      "lc14", "lc13", "lc12", "lc11", "lc9", "lc8", "lc7", "lc6",
      "lc4", "lc3", "lc2", "lc1"
    ]
  }'

echo -e "\n\n"

# Create UFC
echo "Creating UFC..."
curl -X POST "${API_BASE_URL}/promotions" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ufc",
    "name": "UFC",
    "subtitle": "Ultimate Fighting Championship",
    "theme": "ufc-theme",
    "color": "#d20a0a",
    "events": ["ufc309"]
  }'

echo -e "\n\n"
echo "✅ Promotions created successfully!"
echo ""
echo "Fetching all promotions..."
curl -X GET "${API_BASE_URL}/promotions"
echo ""
