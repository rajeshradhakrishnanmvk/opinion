#!/bin/bash
# Script to verify all Firebase App Hosting secrets are properly configured

echo "=========================================="
echo "Firebase App Hosting Secrets Verification"
echo "=========================================="
echo ""

BACKEND_NAME="opinion"
SECRETS=(
  "FIREBASE_API_KEY"
  "FIREBASE_AUTH_DOMAIN"
  "FIREBASE_PROJECT_ID"
  "FIREBASE_STORAGE_BUCKET"
  "MESSAGING_SENDER_ID"
  "APP_ID"
  "MEASUREMENT_ID"
)

echo "Backend: $BACKEND_NAME"
echo ""

all_good=true

for secret in "${SECRETS[@]}"; do
  echo "Checking $secret..."
  
  # Check if secret exists
  if firebase apphosting:secrets:describe "$secret" &>/dev/null; then
    echo "  ✓ Secret exists"
    
    # Try to access the secret (this will work if access is granted)
    value=$(firebase apphosting:secrets:access "$secret" 2>/dev/null)
    if [ -n "$value" ]; then
      # Don't print full value for security, just show it's accessible
      echo "  ✓ Access granted (value length: ${#value})"
    else
      echo "  ✗ Access NOT granted - run: firebase apphosting:secrets:grantaccess $secret --backend $BACKEND_NAME"
      all_good=false
    fi
  else
    echo "  ✗ Secret does NOT exist"
    echo "    Create it with: firebase apphosting:secrets:set $secret"
    all_good=false
  fi
  echo ""
done

echo "=========================================="
if [ "$all_good" = true ]; then
  echo "✓ All secrets are properly configured!"
  echo ""
  echo "Next steps:"
  echo "1. Commit and push your changes to trigger GitHub Actions"
  echo "2. Or manually deploy with: firebase apphosting:rollouts:create $BACKEND_NAME --branch main"
else
  echo "✗ Some secrets need attention (see above)"
fi
echo "=========================================="
