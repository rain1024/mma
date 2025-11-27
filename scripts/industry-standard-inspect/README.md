# Industry Standard Inspect

Static analysis tool for industry standard documentation.

## Features

- Count lines (total, content, code blocks)
- Verify document format (required sections: References, Date, Checklist)
- Display directory structure
- Count references and checklist items

## Usage

```bash
# Install dependencies
uv sync

# Run analysis
uv run python static_analysis.py
```

## Output

The tool produces:

1. **Directory Structure** - Visual tree of documentation files
2. **Summary Statistics** - Total files, lines, valid/invalid counts
3. **File Analysis** - Per-file breakdown by category
4. **Format Validation Errors** - Files missing required sections

## Required Sections

Every industry standard document must have:

- `## References` - Links to authoritative sources
- `## Date` - Document dates and updates
- `## Checklist` - Actionable checklist items

## Recommended Sections

- `## TÕng quan` - Overview/summary
