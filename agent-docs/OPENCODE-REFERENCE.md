# OpenCode Integration Reference

> **SST OpenCode** (opencode.ai, github.com/sst/opencode) - 85k+ stars
> Not to be confused with the archived opencode-ai/opencode (now "Crush")

## Quick Facts

| Aspect | OpenCode | Claude Code |
|--------|----------|-------------|
| Config file | `opencode.jsonc` | `settings.json` |
| State directory | `.opencode/` | `.claude/` |
| Commands location | `~/.opencode/commands/` | Plugin commands |
| Skills location | `.opencode/skill/` | `.claude/skills/` |
| Agent definitions | `.opencode/agent/*.md` | Plugin agents |
| Model selection | Any provider (75+) | Anthropic only |
| User questions | Numbered list | Checkboxes |
| Project instructions | `AGENTS.md` (reads `CLAUDE.md` too) | `CLAUDE.md` |

---

## What Our Installer Does

When user runs `awesome-slash` and selects OpenCode:

```
~/.awesome-slash/           # Full package copy
~/.opencode/commands/awesome-slash/
├── deslop-around.md        # From plugins/deslop-around/commands/
├── enhance.md              # From plugins/enhance/commands/
├── next-task.md            # From plugins/next-task/commands/
├── delivery-approval.md
├── update-docs-around.md
├── project-review.md       # From plugins/project-review/commands/
├── ship.md                 # From plugins/ship/commands/
└── reality-check-scan.md   # From plugins/reality-check/commands/scan.md

~/.config/opencode/opencode.json  # MCP config added
```

**MCP Configuration Added:**
```json
{
  "mcp": {
    "awesome-slash": {
      "type": "local",
      "command": ["node", "~/.awesome-slash/mcp-server/index.js"],
      "environment": {
        "PLUGIN_ROOT": "~/.awesome-slash",
        "AI_STATE_DIR": ".opencode"
      },
      "enabled": true
    }
  }
}
```

---

## Model Selection

### OpenCode Model Format

```
provider/model
```

**Examples:**
- `opencode/claude-opus-4-5` - Via OpenCode's proxy
- `anthropic/claude-opus-4-5` - Direct Anthropic
- `openai/gpt-4o` - OpenAI
- `groq/llama-3.3-70b` - Groq

### Specifying Model in Commands

OpenCode commands can specify model in frontmatter:

```yaml
---
description: Complex analysis task
agent: general
model: opencode/claude-opus-4-5
subtask: true
---
```

### Specifying Model in Agents

```yaml
# .opencode/agent/my-agent.md
---
description: Deep analysis agent
mode: subagent
model: opencode/claude-opus-4-5
temperature: 0.7
steps: 50
permission:
  edit: allow
  bash: ask
---

System prompt content here...
```

### Per-Agent Config in opencode.jsonc

```jsonc
{
  "agent": {
    "build": {
      "model": "opencode/claude-opus-4-5"
    },
    "triage": {
      "model": "opencode/claude-haiku-4-5"
    }
  }
}
```

---

## User Interaction Differences

### The Checkbox Problem

**Claude Code** - AskUserQuestion renders as interactive checkboxes:
```
☑ Option A (Recommended)
☐ Option B
☐ Option C
```

**OpenCode** - Questions render as numbered list:
```
1) Option A
2) Option B
3) Option C

Your selection: _
```

### OpenCode Question API

```typescript
// OpenCode's Question format
{
  question: "Which task source?",
  header: "Task Source",           // max 30 chars
  options: [
    { label: "GitHub Issues", description: "Fetch from gh issues" },
    { label: "Linear", description: "Fetch from Linear" }
  ],
  multiple: true,    // Allow multi-select (comma-separated numbers)
  custom: true       // Allow typing custom answer
}
```

### Implication for awesome-slash

Our agents use `AskUserQuestion` which works in both platforms, but:
- Claude Code: Beautiful checkbox UI
- OpenCode: Functional numbered list

**No code changes needed** - the functionality works, just different UI.

---

## Command Format Comparison

### Claude Code Format (Current)

```yaml
---
description: Task description
argument-hint: "[filter] [--status]"
allowed-tools: Bash(git:*), Read, Write, Task
---

# Command Title

Instructions...
```

### OpenCode Format

```yaml
---
description: Task description
agent: general              # Which agent handles this
model: opencode/claude-opus-4-5  # Optional model override
subtask: true               # Run as subtask (background)
---

Instructions with $1, $2, $ARGUMENTS placeholders...
```

### Key Differences

| Field | Claude Code | OpenCode |
|-------|-------------|----------|
| Tool restrictions | `allowed-tools` | `permission` block in agent |
| Arguments | `argument-hint` | `$1`, `$2`, `$ARGUMENTS` |
| Model | Inherited | `model` field |
| Agent selection | N/A | `agent` field |
| Background exec | N/A | `subtask: true` |

---

## Agent System

### Built-in OpenCode Agents

| Agent | Mode | Purpose |
|-------|------|---------|
| `build` | primary | Default, full tool access |
| `plan` | primary | Read-only, requires approval |
| `general` | subagent | Multi-step research |
| `explore` | subagent | Fast read-only exploration |

### Agent Modes

- **primary** - Can be default agent for sessions
- **subagent** - Called via Task tool from other agents
- **all** - Both primary and subagent

### Custom Agent Definition

```yaml
# .opencode/agent/opus-reviewer.md
---
description: Deep code review with Opus
mode: subagent
model: opencode/claude-opus-4-5
color: "#FF6B6B"
temperature: 0.3
steps: 100
permission:
  read: allow
  edit: ask
  bash: deny
---

You are a senior code reviewer. Analyze code thoroughly...
```

---

## MCP Integration

### Local Server (Our Setup)

```jsonc
{
  "mcp": {
    "awesome-slash": {
      "type": "local",
      "command": ["node", "/path/to/mcp-server/index.js"],
      "environment": { "PLUGIN_ROOT": "...", "AI_STATE_DIR": ".opencode" },
      "enabled": true,
      "timeout": 10000
    }
  }
}
```

### Remote Server (HTTP)

```jsonc
{
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
```

### MCP Tools Available

All 8 tools work identically in OpenCode:
- `workflow_status` - Get current workflow state
- `workflow_start` - Start new workflow
- `workflow_resume` - Resume from checkpoint
- `workflow_abort` - Cancel and cleanup
- `task_discover` - Find tasks from sources
- `review_code` - Pattern-based code review
- `slop_detect` - 3-phase slop detection
- `enhance_analyze` - Quality analyzers

---

## Skill System

### Skill Location

OpenCode scans (in order):
1. `.opencode/skill/<name>/SKILL.md`
2. `.claude/skills/<name>/SKILL.md` (Claude Code compatibility)
3. `~/.config/opencode/skills/`

### Skill Format

```yaml
# .opencode/skill/my-skill/SKILL.md
---
name: my-skill
description: When to use this skill
---

Skill content and instructions...
```

### Compatibility

Our skills in `.claude/skills/` are automatically discovered by OpenCode.
No duplication needed.

---

## Configuration Hierarchy

**Merge order (lowest to highest priority):**
1. Remote org configs (`.well-known/opencode`)
2. Global: `~/.config/opencode/opencode.json`
3. Custom path: `OPENCODE_CONFIG` env var
4. Project: `opencode.jsonc` in project root
5. Inline: `OPENCODE_CONFIG_CONTENT` env var

### Variable Substitution

```jsonc
{
  "provider": {
    "anthropic": {
      "api_key": "{env:ANTHROPIC_API_KEY}"
    }
  }
}
```

---

## Permission System

### Permission Actions

- `allow` - Always allow
- `deny` - Always deny
- `ask` - Prompt user each time

### Pattern-Based Permissions

```jsonc
{
  "permission": {
    "edit": {
      "*.env": "ask",
      "*.env.example": "allow",
      "*": "allow"
    },
    "bash": "ask",
    "external_directory": "deny"
  }
}
```

### Per-Agent Permissions

```yaml
# In agent definition
permission:
  read: allow
  edit: ask
  bash: deny
  glob: allow
  grep: allow
```

---

## Project Instructions

### File Detection (auto-scanned)

OpenCode automatically reads:
1. `AGENTS.md` (preferred)
2. `CLAUDE.md` (fallback - compatibility)
3. `.github/copilot-instructions.md`
4. `.cursorrules`
5. `opencode.md`

### Generating AGENTS.md

```bash
# In OpenCode
/init
```

Creates `AGENTS.md` with project context.

---

## Known Limitations

### UI Differences (Not Fixable)

1. **Questions show as numbers, not checkboxes** - OpenCode limitation
2. **No rich markdown in responses** - Terminal rendering

### Functional Gaps

1. **No hook system** - OpenCode has plugins with hooks, but different from Claude Code hooks
2. **No marketplace** - Manual installation only
3. **Agent format differs** - Our agents work via Task tool, not native OpenCode agents

### Workarounds

| Issue | Workaround |
|-------|------------|
| No checkboxes | Works functionally, just different UI |
| Model selection | Users can set in `opencode.jsonc` |
| Agent definitions | MCP tools work; native agents need manual setup |

---

## Testing OpenCode Integration

### Verify MCP Connection

```bash
# In OpenCode session
# Use any MCP tool
workflow_status
```

### Verify Commands

```bash
# Should list awesome-slash commands
/next-task
/deslop-around
/ship
```

### Verify State Directory

```bash
# After running workflow
ls .opencode/
# Should see: tasks.json, flow.json (in worktree)
```

---

## Improvement Opportunities

### Short Term

1. Add `model:` hints to complex commands for better OpenCode experience
2. Document the numbered-list vs checkbox difference
3. Add OpenCode-specific examples to USAGE.md

### Medium Term

1. Create native OpenCode agent definitions (`.opencode/agent/`)
2. Add OpenCode plugin with hooks for workflow enforcement
3. Test with different model providers

### Long Term

1. OpenCode-native UI for task selection
2. Integrate with OpenCode's built-in agents
3. Cross-platform state sync

---

## Resources

- **Docs**: https://opencode.ai/docs
- **GitHub**: https://github.com/sst/opencode
- **Config Schema**: https://opencode.ai/config.json
- **SDK**: `npm install @opencode-ai/sdk`
