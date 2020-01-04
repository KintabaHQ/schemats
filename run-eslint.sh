#!/usr/bin/env bash
set -o errexit
set -o pipefail

CHANGED_FILES=$(git diff --name-only --diff-filter=d --cached -- ./ |  grep -E '.ts$' | grep -v -E ".d.ts$" | tr '\n' ' ')
npm run fix:lint $CHANGED_FILES
