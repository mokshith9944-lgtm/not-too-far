#!/usr/bin/env bash
set -e

REPO_NAME="not-too-far"
GITHUB_USER="mokshith9944-lgtm"
REMOTE_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo "=========================================================="
echo "🚀 Connecting Antigravity project to '${REPO_NAME}'"
echo "=========================================================="

echo "1. Updating Git remote to: ${REMOTE_URL}"
git remote set-url origin "${REMOTE_URL}" 2>/dev/null || git remote add origin "${REMOTE_URL}"

echo "2. Pushing main branch..."
git push -u origin main

echo ""
echo "✅ Code successfully pushed to https://github.com/${GITHUB_USER}/${REPO_NAME}!"
echo "Now import it into Vercel at https://vercel.com/new to get your live https://${REPO_NAME}.vercel.app URL!"
