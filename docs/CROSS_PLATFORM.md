# Cross-Platform Integration Guide

This document describes how to use awesome-slash-commands with different AI coding assistants.

## Supported Platforms

| Platform | Integration Method | Status |
|----------|-------------------|--------|
| Claude Code | Native plugins | ✅ Full support |
| OpenCode | MCP + Agent configs | ✅ Supported |
| Codex CLI | MCP + Skills | ✅ Supported |

## Common Architecture

All three platforms share:

1. **MCP (Model Context Protocol)** - Universal tool interface
2. **Agent/Subagent systems** - Specialized assistants with tool restrictions
3. **Slash commands** - User-invoked actions
4. **Configuration files** - JSON/YAML/Markdown formats

## Claude Code (Native)

Use the plugins directly:

```bash
# Clone the repository
git clone https://github.com/avifenesh/awesome-slash.git

# Install in Claude Code
claude --add-plugin /path/to/awesome-slash/plugins/next-task
claude --add-plugin /path/to/awesome-slash/plugins/ship
```

### Available Commands
- `/next-task` - Master workflow orchestrator
- `/ship` - Complete PR workflow

### Available Agents (18 Total)

**Core Workflow (Opus):**
- `exploration-agent` - Deep codebase analysis (tools: Read, Grep, Glob, LSP, Task)
- `planning-agent` - Design implementation plans (tools: Read, Grep, EnterPlanMode, Task)
- `implementation-agent` - Execute plans with quality code (tools: Read, Write, Edit, Bash, Task)
- `review-orchestrator` - Multi-agent code review with iteration (tools: Task)

**Quality Gates (Sonnet):**
- `deslop-work` - Clean AI slop from committed but unpushed changes
- `test-coverage-checker` - Validate new work has test coverage
- `delivery-validator` - Autonomous delivery validation
- `docs-updater` - Update docs related to changes

**Operational (Sonnet/Haiku):**
- `policy-selector` - Configure workflow policy [haiku]
- `task-discoverer` - Find and prioritize tasks [sonnet]
- `worktree-manager` - Create isolated worktrees [haiku]
- `ci-monitor` - Monitor CI status with sleep loops [haiku]
- `ci-fixer` - Fix CI failures and PR comments [sonnet]
- `simple-fixer` - Execute pre-defined code fixes [haiku]

**Reality Check (Sonnet/Opus):**
- `issue-scanner` - Analyze GitHub issues, PRs, milestones [sonnet]
- `doc-analyzer` - Examine documentation for plans [sonnet]
- `code-explorer` - Deep codebase structure analysis [sonnet]
- `plan-synthesizer` - Combine findings into prioritized plan [opus]

## OpenCode Integration

### Option 1: MCP Server (Recommended)

Add to your OpenCode MCP config:

```json
{
  "mcpServers": {
    "awesome-slash": {
      "command": "node",
      "args": ["/path/to/awesome-slash/mcp-server/index.js"],
      "env": {
        "PLUGIN_ROOT": "/path/to/awesome-slash"
      }
    }
  }
}
```

### Option 2: Agent Configuration

Create agent definitions in OpenCode format:

```bash
# Global agents
mkdir -p ~/.config/opencode/agent/

# Agent files follow OpenCode markdown format (see below)
```

**OpenCode Agent Format** (`.opencode/agent/workflow.md`):

```markdown
---
name: workflow-orchestrator
model: claude-sonnet-4-20250514
tools:
  read: true
  write: true
  bash: true
  glob: true
  grep: true
---

You are a workflow orchestrator that manages development tasks.

When invoked, you should:
1. Check for existing workflow state in .claude/workflow-state.json
2. Continue from the last checkpoint if resuming
3. Follow the 18-phase workflow from policy selection to completion
```

## Codex CLI Integration

### Option 1: MCP Server

Add to your Codex config:

```json
{
  "mcpServers": {
    "awesome-slash": {
      "command": "node",
      "args": ["/path/to/awesome-slash/mcp-server/index.js"]
    }
  }
}
```

### Option 2: Custom Skills

Create Codex skills that invoke the MCP server tools:

```yaml
# ~/.codex/skills/next-task.yaml
name: next-task
description: Intelligent task prioritization with code validation
trigger: "find next task|what should I work on|prioritize tasks"
mcp_tool: workflow_start
```

## MCP Server Tools

When using the MCP server integration, these tools become available:

| Tool | Description |
|------|-------------|
| `workflow_status` | Get current workflow state |
| `workflow_start` | Start a new workflow with policy settings |
| `workflow_resume` | Resume from last checkpoint |
| `workflow_abort` | Cancel workflow and cleanup resources |
| `task_discover` | Find and prioritize tasks from gh-issues, linear, or tasks-md |
| `review_code` | Run pattern-based code review on changed files |

## Shared Libraries

All integrations use the same core libraries:

```
lib/
├── config/
│   ├── index.js               # Configuration management
│   └── README.md              # Configuration documentation
├── state/
│   ├── workflow-state.js      # State management
│   └── workflow-state.schema.json
├── platform/
│   ├── detect-platform.js     # Auto-detect project type
│   └── verify-tools.js        # Check required tools
├── patterns/
│   ├── review-patterns.js     # Code review patterns
│   └── slop-patterns.js       # AI slop detection
└── utils/
    ├── shell-escape.js        # Safe shell command construction
    └── context-optimizer.js   # Git command optimization
```

## Platform-Specific Considerations

### Claude Code
- Full plugin support with hooks, agents, commands
- Native state management integration
- Best experience with opus model for complex tasks

### OpenCode
- Works with any model provider (Claude, OpenAI, Google, local)
- Agent definitions in Markdown format
- Custom tools via MCP

### Codex CLI
- OpenAI-native with GPT-5-Codex
- Skills system for custom actions
- MCP for external tools

## Migration Guide

### From Claude Code to OpenCode

1. Copy workflow state file: `.claude/workflow-state.json`
2. Install MCP server (recommended) or use agent conversion script
3. Configure OpenCode MCP settings

### From Claude Code to Codex

1. Copy workflow state file: `.claude/workflow-state.json`
2. Install MCP server (recommended)
3. Configure Codex MCP settings

## Contributing

To add support for a new platform:

1. Create installation script in `scripts/install/<platform>.sh`
2. Add platform-specific configuration examples
3. Test MCP server integration with the target platform
4. Submit PR with documentation
