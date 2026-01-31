# agent-browser Quick Reference

Browser automation CLI for Claude Code. Use instead of Playwright MCP.

## Common Commands

```bash
# Navigate to URL
agent-browser open <url>

# Get page snapshot with interactive element refs
agent-browser snapshot -i

# Click element by ref
agent-browser click @ref

# Fill input field
agent-browser fill @ref "text"

# Type and submit (press Enter)
agent-browser fill @ref "text" --submit

# Take screenshot
agent-browser screenshot path.png

# Press key
agent-browser key Enter
agent-browser key Tab

# Wait for element/text
agent-browser wait "text to appear"

# Close browser
agent-browser close
```

## Workflow Example

```bash
# 1. Open page
agent-browser open https://example.com

# 2. Get interactive elements with refs
agent-browser snapshot -i

# 3. Interact using refs from snapshot
agent-browser fill @input-email "user@example.com"
agent-browser click @button-submit

# 4. Verify result
agent-browser snapshot -i

# 5. Screenshot if needed
agent-browser screenshot result.png

# 6. Close when done
agent-browser close
```

## Tips

- Always run `snapshot -i` to get element refs before interacting
- Refs look like `@button-login`, `@input-search`, etc.
- Screenshots go to current directory by default
- Use `--submit` with `fill` to press Enter after typing
