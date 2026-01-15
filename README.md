# Awesome Slash Commands

> Professional-grade slash commands for Claude Code that work across any project

A Claude marketplace plugin providing powerful, zero-configuration slash commands for common development workflows. No setup required - commands automatically detect your project type, CI/CD platform, and deployment environment.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/avifenesh/awsome-slash.svg)](https://github.com/avifenesh/awsome-slash/stargazers)

## Quick Start

### Install from GitHub (One Command!)

```bash
# Install directly from GitHub URL
claude plugin install https://github.com/avifenesh/awsome-slash

# Or using the shorthand
claude plugin install avifenesh/awsome-slash
```

That's it! Restart Claude Code and start using the commands.

### Install from Marketplace (Coming Soon)

```bash
claude plugin install awesome-slash-commands
```

### Verify Installation

```bash
# Check plugin is installed
claude plugin list

# Test in any project
claude
> /help
# Should show all 5 commands
```

**See [INSTALLATION.md](./INSTALLATION.md) for detailed instructions and troubleshooting.**

### Prerequisites

- **Git** - Required for all commands
- **GitHub CLI (gh)** - Required for `/ship` and `/pr-merge`
  ```bash
  # macOS: brew install gh
  # Windows: winget install GitHub.cli
  # Then: gh auth login
  ```

## Features

- **Zero Configuration** - Auto-detects everything: CI platform, deployment setup, project type, package manager
- **Cross-Platform** - Works on Windows, macOS, and Linux
- **Generic by Design** - No hardcoded project names, URLs, or paths
- **Context Efficient** - Optimized to minimize token usage
- **Strong Validation** - Agents verify their work with evidence
- **Graceful Degradation** - Commands work even when optional tools are missing

## Commands

### `/ship` - Complete PR Workflow with Deployment
Ship your code from commit to production with full validation.

```bash
/ship
/ship --strategy rebase
```

**What it does:**
- Commits your changes
- Creates a PR with generated description
- Waits for CI to pass
- Runs subagent quality reviews (code, security, tests)
- Merges to main
- Deploys to development (if multi-branch workflow detected)
- Validates deployment
- Deploys to production (if stable branch exists)
- Validates production
- Cleans up branches and worktrees

**Supports:** GitHub Actions, GitLab CI, CircleCI, Jenkins | Railway, Vercel, Netlify, Fly.io

---

### `/next-task` - Intelligent Task Prioritization
Discover what to work on next with AI-powered task analysis.

```bash
/next-task
/next-task bug
/next-task --include-blocked
```

**What it does:**
- Analyzes GitHub Issues (required)
- Checks Linear tasks (if available)
- Reads PLAN.md (if exists)
- Validates tasks aren't already implemented
- Prioritizes by impact, urgency, and effort
- Provides top 5 recommendations with evidence
- Optionally starts multi-agent implementation workflow

**Requires:** GitHub CLI (`gh`)
**Optional:** Linear integration, PLAN.md

---

### `/deslop-around` - AI Slop Cleanup
Remove debugging code, old TODOs, and other AI slop from your codebase.

```bash
/deslop-around
/deslop-around --apply
/deslop-around --pattern console.log
```

**What it does:**
- Scans for: console.logs, print statements, old TODOs, commented code, placeholder text, empty catch blocks, magic numbers
- Generates detailed report or auto-applies fixes
- Runs verification (auto-detects test framework)
- Preserves functionality with minimal diffs

**Supports:** Node.js, Python, Rust, Go | Jest, Pytest, Cargo test, Go test

---

### `/project-review` - Multi-Agent Code Review
Comprehensive code review with specialized AI agents.

```bash
/project-review
/project-review --recent
/project-review --domain security
```

**What it does:**
- Deploys specialized agents (security, performance, architecture, testing, etc.)
- Adapts agent focus to your tech stack (React, Django, Rust, etc.)
- Finds bugs, security issues, performance problems
- Auto-fixes issues where possible
- Iterates until zero issues remain (max 5 rounds)
- Optionally tracks tech debt in TECHNICAL_DEBT.md

**Detects:** React, Vue, Angular, Django, FastAPI, Actix, Gin, and more

---

### `/pr-merge` - Intelligent PR Merge Procedure
Merge PRs with comprehensive validation and deployment testing.

```bash
/pr-merge
/pr-merge 123
/pr-merge 123 --strategy rebase
```

**What it does:**
- Addresses all review comments
- Runs subagent validation (code quality, security, test coverage)
- Waits for CI to pass
- Merges PR
- Tests development environment (if multi-branch)
- Merges to production (if stable branch exists)
- Validates production deployment
- Auto-rollback on failure
- Cleans up branches

**Supports:** Same platforms as `/ship`

---

## Installation

### Prerequisites

- Claude Code CLI
- Git
- GitHub CLI (`gh`) - for PR-related commands
- Node.js (for platform detection scripts)

### Install Plugin

```bash
# Via Claude marketplace (recommended)
claude plugin install awesome-slash-commands

# Or manual installation
git clone https://github.com/avifenesh/awsome-slash.git
cd awsome-slash
npm install
```

### Optional Tools

These tools enable additional features but aren't required:

- **Railway CLI** - for Railway deployment support
- **Vercel CLI** - for Vercel deployment support
- **Netlify CLI** - for Netlify deployment support
- **Linear** - for Linear task integration

## Platform Support

### CI/CD Platforms
- GitHub Actions
- GitLab CI
- CircleCI
- Jenkins
- Travis CI
- Generic CI (auto-adapts)

### Deployment Platforms
- Railway
- Vercel
- Netlify
- Fly.io
- Platform.sh
- Render
- Generic GitHub Actions deploys

### Project Types
- Node.js (npm, pnpm, yarn, bun)
- Python (pip, poetry, pipenv)
- Rust (cargo)
- Go (go mod)
- Java (Maven, Gradle)

### Frameworks Detected
- **Frontend:** React, Vue, Angular, Svelte
- **Backend:** Django, FastAPI, Express, Actix, Gin
- **Testing:** Jest, Vitest, Pytest, Cargo test, Go test

## How It Works

Commands use a sophisticated detection system:

1. **Platform Detection** - Scans your project for CI configs, deployment files, lockfiles
2. **Tool Verification** - Checks which dev tools are available
3. **Adaptive Execution** - Runs commands appropriate for your setup
4. **Graceful Degradation** - Skips optional features when tools missing

All detection happens automatically - no configuration files needed!

## Examples

### Ship a feature from commit to production
```bash
# Make your changes
git add .
/ship
# Commits, creates PR, waits for CI, reviews code, merges, deploys, validates
```

### Find and fix code quality issues
```bash
/project-review
# Runs specialized agents, finds issues, auto-fixes them, iterates until clean
```

### Clean up debugging code
```bash
/deslop-around --apply
# Removes console.logs, old TODOs, commented code, runs tests to verify
```

### Discover next priority task
```bash
/next-task
# Analyzes issues, validates code status, recommends top tasks with evidence
```

## Documentation

- [Command Reference](./docs/COMMANDS.md) - Detailed documentation for each command
- [Platform Support](./docs/PLATFORM_SUPPORT.md) - Full compatibility matrix
- [Customization](./docs/CUSTOMIZATION.md) - Extend detection and patterns
- [Contributing](./CONTRIBUTING.md) - Contribution guidelines

## Roadmap

- [ ] Support for Cursor, Gemini CLI, Codex CLI (#1)
- [ ] BitBucket Pipelines support
- [ ] Azure DevOps support
- [ ] AWS CodePipeline support
- [ ] Custom pattern library system
- [ ] Plugin configuration file (optional overrides)

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT © Avi Fenesh

## Support

- **Issues:** https://github.com/avifenesh/awsome-slash/issues
- **Discussions:** https://github.com/avifenesh/awsome-slash/discussions

---

Made with ❤️ for the Claude Code community
