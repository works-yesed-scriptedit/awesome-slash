#!/usr/bin/env bash
set -e

# Codex CLI Installer for awesome-slash commands
# This script installs all 5 slash commands for use with OpenAI Codex CLI

echo "🚀 Installing awesome-slash commands for Codex CLI..."
echo

# Configuration
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CODEX_CONFIG_DIR="${HOME}/.codex"
CODEX_PROMPTS_DIR="${CODEX_CONFIG_DIR}/prompts"
CODEX_LIB_DIR="${CODEX_CONFIG_DIR}/awesome-slash/lib"

# Detect OS and normalize paths
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  IS_WINDOWS=true
  # Convert Windows path to Unix-style for bash compatibility
  CODEX_CONFIG_DIR="${USERPROFILE}/.codex"
  # Replace backslashes with forward slashes
  CODEX_CONFIG_DIR="${CODEX_CONFIG_DIR//\\//}"
  CODEX_PROMPTS_DIR="${CODEX_CONFIG_DIR}/prompts"
  CODEX_LIB_DIR="${CODEX_CONFIG_DIR}/awesome-slash/lib"
else
  IS_WINDOWS=false
fi

echo "📂 Configuration:"
echo "  Repository: $REPO_ROOT"
echo "  Prompts to: $CODEX_PROMPTS_DIR"
echo "  Libraries to: $CODEX_LIB_DIR"
echo

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from: https://nodejs.org"
  exit 1
fi
NODE_VERSION=$(node --version)
echo "  ✓ Node.js $NODE_VERSION"

# Check Git
if ! command -v git &> /dev/null; then
  echo "❌ Git not found. Install from: https://git-scm.com"
  exit 1
fi
GIT_VERSION=$(git --version | cut -d' ' -f3)
echo "  ✓ Git $GIT_VERSION"

# Check Codex CLI (optional - user may not have it installed yet)
if command -v codex &> /dev/null; then
  CODEX_VERSION=$(codex --version 2>&1 | head -n1 || echo "unknown")
  echo "  ✓ Codex CLI $CODEX_VERSION"
else
  echo "  ⚠️  Codex CLI not found (install from: https://developers.openai.com/codex/cli)"
  echo "     You can still install commands and use Codex CLI later"
fi

echo

# Create directories
echo "📁 Creating directories..."
mkdir -p "$CODEX_PROMPTS_DIR"
mkdir -p "$CODEX_LIB_DIR"/{platform,patterns,utils}
echo "  ✓ Created $CODEX_PROMPTS_DIR"
echo "  ✓ Created $CODEX_LIB_DIR"
echo

# Copy library files from shared root lib directory
echo "📚 Installing shared libraries..."
# Use explicit iteration to handle paths with spaces safely
for item in "${REPO_ROOT}/lib"/*; do
  cp -r "$item" "${CODEX_LIB_DIR}/"
done
echo "  ✓ Copied platform detection"
echo "  ✓ Copied pattern libraries"
echo "  ✓ Copied utility functions"
echo

# Install commands with path adjustments
echo "⚙️  Installing commands..."

COMMANDS=(
  "deslop-around"
  "next-task"
  "project-review"
  "ship"
  "pr-merge"
)

for cmd in "${COMMANDS[@]}"; do
  SOURCE_FILE="$REPO_ROOT/plugins/$cmd/commands/$cmd.md"
  # Install directly in prompts directory (Codex looks here)
  TARGET_FILE="$CODEX_PROMPTS_DIR/$cmd.md"

  if [ -f "$SOURCE_FILE" ]; then
    # Replace Claude-specific path variables with Codex lib paths
    # Escape sed special characters in path to prevent injection
    SAFE_LIB_DIR=$(echo "${CODEX_LIB_DIR}/.." | sed 's/[&/\]/\\&/g')
    sed "s|\${CLAUDE_PLUGIN_ROOT}|${SAFE_LIB_DIR}|g" "$SOURCE_FILE" > "$TARGET_FILE"
    echo "  ✓ Installed /prompts:$cmd"
  else
    echo "  ⚠️  Skipped /$cmd (source not found)"
  fi
done

echo

# Create README
cat > "$CODEX_CONFIG_DIR/AWESOME_SLASH_README.md" << 'EOF'
# awesome-slash for Codex CLI

Commands installed for OpenAI Codex CLI.

## Available Commands

Access via /prompts: menu:
- `/prompts:deslop-around` - AI slop cleanup
- `/prompts:next-task` - Task prioritization
- `/prompts:project-review` - Code review
- `/prompts:ship` - PR workflow
- `/prompts:pr-merge` - PR merge

## Usage

In Codex CLI:
```bash
codex
> /prompts:deslop-around
> /prompts:next-task bug
> /prompts:ship --strategy rebase
```

Or type `/prompts:` to see the menu.

## Libraries

Shared libraries at: ~/.codex/awesome-slash/lib/

## Updates

```bash
cd /path/to/awesome-slash
./adapters/codex/install.sh
```

## Support

- Repository: https://github.com/avifenesh/awesome-slash
- Issues: https://github.com/avifenesh/awesome-slash/issues
EOF

echo "  ✓ Created README"
echo

# Success message
echo "✅ Installation complete!"
echo
echo "📋 Installed Commands (access via /prompts: menu):"
for cmd in "${COMMANDS[@]}"; do
  echo "  • /prompts:$cmd"
done
echo
echo "📖 Next Steps:"
echo "  1. Start Codex CLI: codex"
echo "  2. Type: /prompts: (shows menu)"
echo "  3. Select a command or type: /prompts:deslop-around"
echo "  4. See help: cat $CODEX_CONFIG_DIR/AWESOME_SLASH_README.md"
echo
echo "💡 Pro Tip: Type /prompts: to see all available prompts"
echo
echo "🔄 To update commands, re-run this installer:"
echo "  ./adapters/codex/install.sh"
echo
echo "Happy coding! 🎉"
