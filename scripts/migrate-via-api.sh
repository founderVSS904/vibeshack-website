#!/bin/bash

PROJECT_ID="o6atri6b"
DATASET="production"
TOKEN="skUOpGG2b6njSSbpUuJiimhNGLEDtImBZFX4aEIa8vKsY32egxZWxWkxWZnAiyyv6fc9Lesc1EMLZlM8aXfGLEqsKE0HWDBd7FjpEfxh336d5RoK5zGoX7EWCHQ17qMzzM4pyiKx7PLgyZMpNhV90CNrBtQA1mJVrF2XdbGdnBzpAAbyusAZ"
URL="https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}"

echo "Creating studios in Sanity..."

curl -X POST "$URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mutations": [
      {"create": {"_type": "studio", "id": "podcast-sunset", "name": "The Executive", "description": "Wood slat walls. Leather seating. Three cameras. Cameraman included.", "price": 300, "tag": "Walnut Series", "type": "podcast", "series": "walnut", "order": 1, "includes": ["3-camera 4K setup", "Broadcast microphones", "Cameraman included", "Walnut Series design", "Hair & Makeup room", "6-12hr footage turnaround"]}},
      {"create": {"_type": "studio", "id": "podcast-modern", "name": "Encore", "description": "Three cameras. Broadcast audio. Cameraman included.", "price": 300, "tag": "Vault Series", "type": "podcast", "series": "vault", "order": 2, "includes": ["3-camera 4K setup", "Broadcast microphones", "Cameraman included", "Hair & Makeup room", "6-12hr footage turnaround"]}},
      {"create": {"_type": "studio", "id": "podcast-cozy", "name": "The Wing", "description": "Intimate layout. Leather seating. Three cameras. Cameraman included.", "price": 300, "tag": "Walnut Series", "type": "podcast", "series": "walnut", "order": 3, "includes": ["3-camera 4K setup", "Broadcast microphones", "Cameraman included", "Walnut Series design", "Hair & Makeup room", "6-12hr footage turnaround"]}},
      {"create": {"_type": "studio", "id": "sunset", "name": "Sunset", "description": "Programmable color backdrop. Four cameras. Cameraman included.", "price": 300, "tag": "Creative Series", "type": "podcast", "series": "creative", "order": 4, "includes": ["4-camera 4K setup", "Programmable color backdrop", "Cameraman included", "Creative Series design", "6-12hr footage turnaround"]}},
      {"create": {"_type": "studio", "id": "white-backdrop", "name": "Canvas", "description": "White cyc wall. Lighting grid. Flexible rental space.", "price": 100, "tag": "Creative Series", "type": "rental", "series": "creative", "order": 5, "includes": ["White cyc wall", "Lighting grid", "Flexible layout", "Creative Series design"]}},
      {"create": {"_type": "studio", "id": "photography", "name": "Photography Studio", "description": "Daylight windows. Backdrops. Lighting kit included.", "price": 100, "tag": "Creative Series", "type": "rental", "series": "creative", "order": 6, "includes": ["Natural daylight", "Professional backdrops", "Lighting kit included", "Creative Series design"]}},
      {"create": {"_type": "studio", "id": "green-screen", "name": "Green Screen Studio", "description": "Infinite green wall. 4K cameras. Lighting rig.", "price": 100, "tag": "Creative Series", "type": "rental", "series": "creative", "order": 7, "includes": ["Infinite green screen", "4K cameras available", "Professional lighting rig", "Creative Series design"]}}
    ]
  }' 2>&1 | grep -o '"operation":"create"' | wc -l

echo ""
echo "Creating add-ons in Sanity..."

curl -X POST "$URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mutations": [
      {"create": {"_type": "addOn", "id": "second-camera", "name": "Second Camera Angle", "description": "We add a second camera for more dynamic, multi-angle coverage.", "price": 50, "order": 1}},
      {"create": {"_type": "addOn", "id": "teleprompter", "name": "Teleprompter", "description": "Scroll your script hands-free, eye-level with the lens.", "price": 25, "order": 2}},
      {"create": {"_type": "addOn", "id": "strategy-call", "name": "Pre-Session Strategy Call", "description": "30 minutes with our team to map out your content before you arrive.", "price": 50, "order": 3}},
      {"create": {"_type": "addOn", "id": "editing-hour", "name": "Editing Hour", "description": "One hour of post-production editing on your footage after the session.", "price": 75, "order": 4}}
    ]
  }' 2>&1 | grep -o '"operation":"create"' | wc -l

echo ""
echo "✓ Migration complete!"
