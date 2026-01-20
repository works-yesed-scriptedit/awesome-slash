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

# Command mappings: target_name:plugin:source_file
# Format allows commands from different plugins
COMMAND_MAPPINGS=(
  "deslop-around:deslop-around:deslop-around"
  "next-task:next-task:next-task"
  "delivery-approval:next-task:delivery-approval"
  "update-docs-around:next-task:update-docs-around"
  "project-review:project-review:project-review"
  "ship:ship:ship"
  "reality-check-scan:reality-check:scan"
)

for mapping in "${COMMAND_MAPPINGS[@]}"; do
  IFS=':' read -r TARGET_NAME PLUGIN SOURCE_NAME <<< "$mapping"
  SOURCE_FILE="$REPO_ROOT/plugins/$PLUGIN/commands/$SOURCE_NAME.md"
  TARGET_FILE="$CODEX_PROMPTS_DIR/$TARGET_NAME.md"

  if [ -f "$SOURCE_FILE" ]; then
    # Copy command file to prompts directory
    cp "$SOURCE_FILE" "$TARGET_FILE"
    echo "  ✓ Installed /prompts:$TARGET_NAME"
  else
    echo "  ⚠️  Skipped /$TARGET_NAME (source not found: $SOURCE_FILE)"
  fi
done

# Remove old/legacy commands that no longer exist
OLD_COMMANDS=("pr-merge")
for old_cmd in "${OLD_COMMANDS[@]}"; do
  if [ -f "$CODEX_PROMPTS_DIR/$old_cmd.md" ]; then
    rm "$CODEX_PROMPTS_DIR/$old_cmd.md"
    echo "  🗑️  Removed legacy /prompts:$old_cmd"
  fi
done

echo

# Configure MCP server
echo "🔌 Configuring MCP server..."
CONFIG_TOML="$CODEX_CONFIG_DIR/config.toml"

# Convert repo path to forward slashes for config
MCP_PATH="${REPO_ROOT//\\//}"

# Check if config.toml exists and has MCP section
if [ -f "$CONFIG_TOML" ]; then
  # Remove old awesome-slash MCP config if exists
  if grep -q "\[mcp_servers.awesome-slash\]" "$CONFIG_TOML" 2>/dev/null; then
    # Use sed to remove the old section (everything between [mcp_servers.awesome-slash] and next section or EOF)
    sed -i '/\[mcp_servers.awesome-slash\]/,/^\[/{ /^\[mcp_servers.awesome-slash\]/d; /^\[/!d; }' "$CONFIG_TOML" 2>/dev/null || true
  fi
fi

# Append MCP server config
cat >> "$CONFIG_TOML" << EOF

[mcp_servers.awesome-slash]
command = "node"
args = ["${MCP_PATH}/mcp-server/index.js"]

[mcp_servers.awesome-slash.env]
PLUGIN_ROOT = "${MCP_PATH}"
EOF

echo "  ✓ Added MCP server to config.toml"
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
