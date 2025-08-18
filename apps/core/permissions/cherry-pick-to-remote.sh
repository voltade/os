#!/bin/bash
set -e

print_usage() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -r, --remote-url URL       Target remote repository URL (required)"
  echo "  -n, --remote-name NAME     Name to use for the remote (default: target_remote)"
  echo "  -b, --target-branch BRANCH Target branch to apply changes to (default: main)"
  echo "  -c, --commit HASH          Specific commit to cherry-pick (default: latest commit)"
  echo "  -h, --help                 Show this help message"
  echo ""
  echo "Example:"
  echo "  $0 --remote-url https://git.example.com/repo.git"
  echo "  $0 -r https://git.example.com/repo.git -b develop -c abc123"
}

# Default values
TARGET_REMOTE_NAME="target_remote"
TARGET_BRANCH="main"
SOURCE_BRANCH=$(git rev-parse --abbrev-ref HEAD)
TEMP_BRANCH="temp-cherry-pick-$(date +%s)"
TARGET_REMOTE_URL=""
SPECIFIC_COMMIT=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
  -r | --remote-url)
    TARGET_REMOTE_URL="$2"
    shift
    shift
    ;;
  -n | --remote-name)
    TARGET_REMOTE_NAME="$2"
    shift
    shift
    ;;
  -b | --target-branch)
    TARGET_BRANCH="$2"
    shift
    shift
    ;;
  -c | --commit)
    SPECIFIC_COMMIT="$2"
    shift
    shift
    ;;
  -h | --help)
    print_usage
    exit 0
    ;;
  *)
    echo "Unknown option: $1"
    print_usage
    exit 1
    ;;
  esac
done

# Check if remote URL is provided
if [ -z "$TARGET_REMOTE_URL" ]; then
  echo "Error: Remote URL is required"
  print_usage
  exit 1
fi

# Check if we have uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "Error: You have uncommitted changes. Please commit or stash them first."
  exit 1
fi

# Get the commit to apply
if [ -z "$SPECIFIC_COMMIT" ]; then
  COMMIT_TO_APPLY=$(git log -1 --format="%H" $SOURCE_BRANCH)
  echo "Using latest commit from current branch"
else
  COMMIT_TO_APPLY=$SPECIFIC_COMMIT
  echo "Using specified commit: $COMMIT_TO_APPLY"
fi

echo "Will apply commit $COMMIT_TO_APPLY from branch $SOURCE_BRANCH to $TARGET_REMOTE_URL on branch $TARGET_BRANCH"
echo "---"

# Check if the remote already exists
if git remote | grep -q "$TARGET_REMOTE_NAME"; then
  echo "Remote $TARGET_REMOTE_NAME already exists, updating URL..."
  git remote set-url $TARGET_REMOTE_NAME $TARGET_REMOTE_URL
else
  echo "Adding remote $TARGET_REMOTE_NAME..."
  git remote add $TARGET_REMOTE_NAME $TARGET_REMOTE_URL
fi

# Fetch the latest from the target remote
echo "Fetching from remote $TARGET_REMOTE_NAME..."
git fetch $TARGET_REMOTE_NAME

# Create and checkout a temporary branch based on the target remote's branch
echo "Creating temporary branch $TEMP_BRANCH from $TARGET_REMOTE_NAME/$TARGET_BRANCH..."
git checkout -b $TEMP_BRANCH $TARGET_REMOTE_NAME/$TARGET_BRANCH

# Cherry-pick the commit
echo "Cherry-picking commit $COMMIT_TO_APPLY..."
if ! git cherry-pick $COMMIT_TO_APPLY; then
  echo "Cherry-pick encountered conflicts. Aborting and cleaning up..."
  git cherry-pick --abort
  git checkout $SOURCE_BRANCH
  git branch -D $TEMP_BRANCH
  exit 1
fi

# Push the changes to the target remote
echo "Pushing changes to $TARGET_REMOTE_NAME/$TARGET_BRANCH..."
if ! git push $TARGET_REMOTE_NAME $TEMP_BRANCH:$TARGET_BRANCH; then
  echo "Failed to push changes. You may need to force push or the remote might have changed."
  echo "Cleaning up..."
  git checkout $SOURCE_BRANCH
  git branch -D $TEMP_BRANCH
  exit 1
fi

# Switch back to the original branch
echo "Switching back to $SOURCE_BRANCH..."
git checkout $SOURCE_BRANCH

# Clean up: delete the temporary branch
echo "Cleaning up: deleting temporary branch $TEMP_BRANCH..."
git branch -D $TEMP_BRANCH

echo "---"
echo "Successfully applied changes to $TARGET_REMOTE_NAME/$TARGET_BRANCH!"
