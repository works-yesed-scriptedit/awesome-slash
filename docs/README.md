# Documentation

> Quick navigation to find what you need.

## Quick Links

| I want to... | Go to |
|-------------|-------|
| Install and start using | [INSTALLATION.md](./INSTALLATION.md) |
| See examples and workflows | [USAGE.md](./USAGE.md) |
| Understand the architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Use with OpenCode or Codex | [CROSS_PLATFORM.md](./CROSS_PLATFORM.md) |

---

## Document Overview

### [INSTALLATION.md](./INSTALLATION.md)
**Who it's for:** Everyone getting started

- Claude Code marketplace installation (30 seconds)
- npm global install for all platforms
- Verification steps
- Prerequisites (Git, Node.js 18+, optional `gh` CLI)
- Troubleshooting common issues

### [USAGE.md](./USAGE.md)
**Who it's for:** Daily users

- Command reference (`/deslop-around`, `/next-task`, `/project-review`, `/ship`)
- Real-world examples with expected output
- Common workflows (new feature, code review, maintenance)
- Tips for success

### [ARCHITECTURE.md](./ARCHITECTURE.md)
**Who it's for:** Contributors and curious engineers

- Directory structure and component organization
- MCP server tools (8 tools available)
- Cross-platform library usage
- State management (tasks.json, flow.json)
- Implementation status and testing

### [CROSS_PLATFORM.md](./CROSS_PLATFORM.md)
**Who it's for:** OpenCode and Codex CLI users

- Platform-specific installation
- Agent list (21 total across 3 plugins)
- MCP configuration examples
- Migration between platforms
- State directory differences

---

## Key Concepts

### Plugins (6 total)

| Plugin | Purpose |
|--------|---------|
| `/next-task` | Task-to-production workflow (14 agents) |
| `/ship` | Complete PR workflow to production |
| `/deslop-around` | 3-phase AI slop detection |
| `/project-review` | Multi-agent code review |
| `/reality-check` | Plan drift detection |
| `/enhance` | Quality analyzer suite (7 agents) |

### State Files

| File | Location | Purpose |
|------|----------|---------|
| `tasks.json` | `.claude/` | Active task registry |
| `flow.json` | `.claude/` (worktree) | Workflow progress |
| `preference.json` | `.claude/sources/` | Cached task source |

Platform-aware: `.claude/` (Claude Code), `.opencode/` (OpenCode), `.codex/` (Codex CLI)

### Detection Pipeline (deslop-around)

| Phase | Certainty | Method |
|-------|-----------|--------|
| 1 | HIGH | Regex patterns (2,232 lines) |
| 2 | MEDIUM | Multi-pass analyzers |
| 3 | LOW | CLI tools (optional) |

---

## Getting Help

- **Issues:** [github.com/avifenesh/awesome-slash/issues](https://github.com/avifenesh/awesome-slash/issues)
- **Discussions:** [github.com/avifenesh/awesome-slash/discussions](https://github.com/avifenesh/awesome-slash/discussions)
- **Main README:** [../README.md](../README.md)
