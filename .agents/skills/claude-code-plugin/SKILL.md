---
name: claude-code-plugin
description: A skill for creating and managing Claude Code plugins, allowing agents to extend Claude's capabilities with custom tools and commands.
---

# Claude Code Plugin Skill

This skill provides instructions and templates for building plugins for Claude Code.

## Plugin Structure

A Claude Code plugin typically resides in a `.claude-plugin` directory or a standalone repository with a `marketplace.json` file.

### Directory Layout

```
my-plugin/
├── .claude-plugin/
│   └── marketplace.json    # Plugin metadata and tool definitions
├── commands/               # Markdown files defining custom commands
│   └── my-command.md
├── README.md               # Documentation
└── ...                     # Implementation files
```

## Creating a Plugin

1. **Define Metadata**: Create `marketplace.json` with plugin name, description, and tools.
2. **Implement Tools**: Tools can be shell commands, python scripts, or any executable.
3. **Define Commands**: Create markdown files in the `commands/` directory to define high-level agent shortcuts.
4. **Register**: Point Claude Code to the plugin directory.

## Best Practices

- **Security**: Always validate input to shell commands.
- **Output**: Use JSON output for programmatic use by the agent.
- **Documentation**: Provide clear `/help` descriptions for all tools.

## Templates

### 1. `marketplace.json`

```json
{
  "name": "plugin-name",
  "owner": { "name": "Author Name" },
  "metadata": { "description": "Short summary" },
  "plugins": [
    {
      "name": "tool-name",
      "source": "./path-to-tool",
      "description": "What the tool does",
      "category": "utility"
    }
  ]
}
```

### 2. Custom Command (`commands/cmd.md`)

```markdown
# /my-command <arg>

Description of what this command does when invoked by the user.

## Steps
1. [Tool] [Arguments]
2. [Instruction for the agent]
```
