#!/usr/bin/env python3
"""
Static Analysis Tool for Industry Standard Documentation

AWS Well-Architected Style Structure:
- Pillars: OPS, SEC, REL, PERF, COST, SUS
- Questions: [PILLAR][NN]-area
- Best Practices: [PILLAR][NN]-BP[NN]-name.md

Example: SEC03-BP05-some-practice.md → Security, Question 3, Best Practice 5
"""

import os
import re
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional

from rich.console import Console
from rich.table import Table
from rich.tree import Tree
from rich.panel import Panel
from rich import box


# Default path to industry standards docs
DEFAULT_DOCS_PATH = Path(__file__).parent.parent.parent / "docs" / "industry-standard"

# Pillar definitions (ordered)
PILLARS = {
    "OPS": "Operational Excellence",
    "REL": "Reliability",
    "PERF": "Performance Efficiency",
    "SEC": "Security",
    "COST": "Cost Optimization",
    "SUS": "Sustainability",
}

# Pillar order for display
PILLAR_ORDER = ["OPS", "REL", "PERF", "SEC", "COST", "SUS"]

# Directory prefix mapping (e.g., "1-OPS" -> "OPS")
DIR_PREFIX_PATTERN = re.compile(r"^(\d+)-([A-Z]+)$")

# Required sections for valid industry standard document
REQUIRED_SECTIONS = [
    "References",
    "Date",
    "Checklist",
]

# Optional but recommended sections
RECOMMENDED_SECTIONS = [
    "Tổng quan",
]

# Regex pattern for best practice filename
BP_PATTERN = re.compile(r"^([A-Z]+)(\d+)-BP(\d+)-(.+)\.md$")


@dataclass
class BestPracticeInfo:
    """Parsed best practice information from filename."""
    pillar: str
    question_num: int
    bp_num: int
    name: str

    @property
    def id(self) -> str:
        return f"{self.pillar}{self.question_num:02d}-BP{self.bp_num:02d}"

    @property
    def pillar_name(self) -> str:
        return PILLARS.get(self.pillar, self.pillar)


@dataclass
class DocumentStats:
    """Statistics for a single document."""
    path: Path
    total_lines: int = 0
    blank_lines: int = 0
    code_lines: int = 0
    content_lines: int = 0
    sections_found: list[str] = field(default_factory=list)
    missing_required: list[str] = field(default_factory=list)
    missing_recommended: list[str] = field(default_factory=list)
    checklist_items: int = 0
    references_count: int = 0
    has_valid_format: bool = True
    errors: list[str] = field(default_factory=list)
    bp_info: Optional[BestPracticeInfo] = None

    @property
    def filename(self) -> str:
        return self.path.name

    @property
    def pillar(self) -> str:
        """Get pillar from parent directories (e.g., 1-OPS -> OPS)."""
        parts = self.path.parts
        for part in parts:
            # Check for numbered prefix (e.g., "1-OPS")
            match = DIR_PREFIX_PATTERN.match(part)
            if match:
                return match.group(2)
            # Check for plain pillar name
            if part in PILLARS:
                return part
        return "OTHER"

    @property
    def question(self) -> str:
        """Get question directory name (e.g., OPS01-prepare)."""
        return self.path.parent.name

    @property
    def bp_id(self) -> str:
        """Get best practice ID from filename."""
        if self.bp_info:
            return self.bp_info.id
        return self.filename


def parse_bp_filename(filename: str) -> Optional[BestPracticeInfo]:
    """Parse best practice filename into components."""
    match = BP_PATTERN.match(filename)
    if match:
        return BestPracticeInfo(
            pillar=match.group(1),
            question_num=int(match.group(2)),
            bp_num=int(match.group(3)),
            name=match.group(4),
        )
    return None


@dataclass
class AnalysisResult:
    """Overall analysis result."""
    docs_path: Path
    documents: list[DocumentStats] = field(default_factory=list)
    total_files: int = 0
    total_lines: int = 0
    valid_files: int = 0
    invalid_files: int = 0

    @property
    def pillars(self) -> dict[str, list[DocumentStats]]:
        """Group documents by pillar."""
        result: dict[str, list[DocumentStats]] = {}
        for doc in self.documents:
            pillar = doc.pillar
            if pillar not in result:
                result[pillar] = []
            result[pillar].append(doc)
        return result

    @property
    def questions(self) -> dict[str, dict[str, list[DocumentStats]]]:
        """Group documents by pillar then question."""
        result: dict[str, dict[str, list[DocumentStats]]] = {}
        for doc in self.documents:
            pillar = doc.pillar
            question = doc.question
            if pillar not in result:
                result[pillar] = {}
            if question not in result[pillar]:
                result[pillar][question] = []
            result[pillar][question].append(doc)
        return result


def analyze_document(file_path: Path) -> DocumentStats:
    """Analyze a single markdown document."""
    stats = DocumentStats(path=file_path)

    # Parse best practice info from filename
    stats.bp_info = parse_bp_filename(file_path.name)

    try:
        content = file_path.read_text(encoding="utf-8")
        lines = content.split("\n")

        stats.total_lines = len(lines)

        in_code_block = False
        for line in lines:
            stripped = line.strip()

            # Track code blocks
            if stripped.startswith("```"):
                in_code_block = not in_code_block
                stats.code_lines += 1
                continue

            if in_code_block:
                stats.code_lines += 1
                continue

            if not stripped:
                stats.blank_lines += 1
            else:
                stats.content_lines += 1

            # Find sections (## headers)
            if stripped.startswith("## "):
                section_name = stripped[3:].strip()
                # Remove any markdown formatting
                section_name = re.sub(r"\*\*|\*|`", "", section_name)
                # Get base section name (before parentheses)
                section_name = section_name.split("(")[0].strip()
                stats.sections_found.append(section_name)

            # Count checklist items
            if re.match(r"^- \[[ x]\]", stripped):
                stats.checklist_items += 1

            # Count references
            if re.match(r"^- \[.+\]\(.+\)", stripped):
                stats.references_count += 1

        # Verify required sections
        sections_lower = [s.lower() for s in stats.sections_found]
        for required in REQUIRED_SECTIONS:
            if required.lower() not in sections_lower:
                stats.missing_required.append(required)
                stats.has_valid_format = False
                stats.errors.append(f"Missing required section: {required}")

        # Check recommended sections
        for recommended in RECOMMENDED_SECTIONS:
            if recommended.lower() not in sections_lower:
                stats.missing_recommended.append(recommended)

    except Exception as e:
        stats.has_valid_format = False
        stats.errors.append(f"Error reading file: {e}")

    return stats


def analyze_directory(docs_path: Path) -> AnalysisResult:
    """Analyze all markdown files in the directory."""
    result = AnalysisResult(docs_path=docs_path)

    if not docs_path.exists():
        return result

    # Find all markdown files (excluding RESOURCES.md at root)
    md_files = sorted(docs_path.rglob("*.md"))

    for md_file in md_files:
        # Skip RESOURCES.md
        if md_file.name == "RESOURCES.md":
            continue

        stats = analyze_document(md_file)
        result.documents.append(stats)
        result.total_files += 1
        result.total_lines += stats.total_lines

        if stats.has_valid_format:
            result.valid_files += 1
        else:
            result.invalid_files += 1

    return result


def build_directory_tree(docs_path: Path) -> Tree:
    """Build a rich Tree showing the directory structure."""
    tree = Tree(
        f"[bold blue]{docs_path.name}/[/bold blue]",
        guide_style="dim",
    )

    def add_to_tree(path: Path, tree_node: Tree) -> None:
        # Get sorted entries (pillars first, then alphabetically)
        entries = sorted(path.iterdir(), key=lambda p: (not p.is_dir(), p.name))

        for entry in entries:
            if entry.name.startswith("."):
                continue

            if entry.is_dir():
                # Check if it's a pillar directory (e.g., "1-OPS")
                match = DIR_PREFIX_PATTERN.match(entry.name)
                if match:
                    pillar_code = match.group(2)
                    pillar_name = PILLARS.get(pillar_code, pillar_code)
                    label = f"[bold cyan]{entry.name}/[/bold cyan] [dim]({pillar_name})[/dim]"
                elif entry.name in PILLARS:
                    label = f"[bold cyan]{entry.name}/[/bold cyan] [dim]({PILLARS[entry.name]})[/dim]"
                else:
                    label = f"[bold cyan]{entry.name}/[/bold cyan]"
                branch = tree_node.add(label)
                add_to_tree(entry, branch)
            elif entry.suffix == ".md":
                # Count lines for display
                try:
                    lines = len(entry.read_text().split("\n"))
                    # Parse BP info
                    bp_info = parse_bp_filename(entry.name)
                    if bp_info:
                        tree_node.add(
                            f"[green]{bp_info.id}[/green] [dim]{bp_info.name} ({lines} lines)[/dim]"
                        )
                    else:
                        tree_node.add(f"[green]{entry.name}[/green] [dim]({lines} lines)[/dim]")
                except:
                    tree_node.add(f"[green]{entry.name}[/green]")

    if docs_path.exists():
        add_to_tree(docs_path, tree)

    return tree


def print_analysis_report(result: AnalysisResult, console: Console) -> None:
    """Print a comprehensive analysis report."""

    # Header
    console.print()
    console.print(Panel.fit(
        "[bold]Industry Standard Documentation Analysis[/bold]\n"
        "[dim]AWS Well-Architected Style Structure[/dim]",
        border_style="blue",
    ))
    console.print()

    # Directory Structure
    console.print("[bold yellow]Directory Structure[/bold yellow]")
    console.print()
    tree = build_directory_tree(result.docs_path)
    console.print(tree)
    console.print()

    # Summary Statistics
    console.print("[bold yellow]Summary Statistics[/bold yellow]")
    console.print()

    summary_table = Table(box=box.ROUNDED, show_header=False)
    summary_table.add_column("Metric", style="cyan")
    summary_table.add_column("Value", style="green")

    summary_table.add_row("Total Files", str(result.total_files))
    summary_table.add_row("Total Lines", str(result.total_lines))
    summary_table.add_row("Valid Format", str(result.valid_files))
    summary_table.add_row("Invalid Format", str(result.invalid_files))
    summary_table.add_row("Pillars", str(len(result.pillars)))
    summary_table.add_row("Questions", str(sum(len(q) for q in result.questions.values())))

    console.print(summary_table)
    console.print()

    # Pillar Summary
    console.print("[bold yellow]Pillar Summary[/bold yellow]")
    console.print()

    pillar_table = Table(box=box.ROUNDED)
    pillar_table.add_column("#", justify="right", style="dim")
    pillar_table.add_column("Pillar", style="cyan")
    pillar_table.add_column("Name", style="white")
    pillar_table.add_column("Questions", justify="right", style="blue")
    pillar_table.add_column("Best Practices", justify="right", style="green")
    pillar_table.add_column("Lines", justify="right", style="yellow")

    for idx, pillar_code in enumerate(PILLAR_ORDER, 1):
        if pillar_code in result.pillars:
            docs = result.pillars[pillar_code]
            questions = result.questions.get(pillar_code, {})
            total_lines = sum(d.total_lines for d in docs)
            pillar_table.add_row(
                str(idx),
                pillar_code,
                PILLARS[pillar_code],
                str(len(questions)),
                str(len(docs)),
                str(total_lines),
            )

    console.print(pillar_table)
    console.print()

    # Detailed File Analysis by Pillar
    console.print("[bold yellow]Best Practice Analysis[/bold yellow]")
    console.print()

    for idx, pillar_code in enumerate(PILLAR_ORDER, 1):
        if pillar_code not in result.pillars:
            continue

        console.print(f"[bold cyan]{idx}. {pillar_code} - {PILLARS[pillar_code]}[/bold cyan]")

        file_table = Table(box=box.SIMPLE)
        file_table.add_column("ID", style="green")
        file_table.add_column("Question", style="white")
        file_table.add_column("Lines", justify="right", style="blue")
        file_table.add_column("Content", justify="right", style="blue")
        file_table.add_column("Code", justify="right", style="yellow")
        file_table.add_column("Refs", justify="right", style="magenta")
        file_table.add_column("Checklist", justify="right", style="cyan")
        file_table.add_column("Valid", justify="center")

        docs = sorted(result.pillars[pillar_code], key=lambda d: d.filename)
        for doc in docs:
            valid_icon = "[green]OK[/green]" if doc.has_valid_format else "[red]ERR[/red]"
            file_table.add_row(
                doc.bp_id,
                doc.question,
                str(doc.total_lines),
                str(doc.content_lines),
                str(doc.code_lines),
                str(doc.references_count),
                str(doc.checklist_items),
                valid_icon,
            )

        console.print(file_table)
        console.print()

    # Format Validation Details
    invalid_docs = [d for d in result.documents if not d.has_valid_format]
    if invalid_docs:
        console.print("[bold red]Format Validation Errors[/bold red]")
        console.print()

        for doc in invalid_docs:
            console.print(f"[red]{doc.pillar}/{doc.question}/{doc.filename}[/red]")
            for error in doc.errors:
                console.print(f"  - {error}")
        console.print()

    # Missing Recommended Sections
    docs_missing_recommended = [
        d for d in result.documents if d.missing_recommended
    ]
    if docs_missing_recommended:
        console.print("[bold yellow]Missing Recommended Sections[/bold yellow]")
        console.print()

        for doc in docs_missing_recommended:
            console.print(f"[yellow]{doc.pillar}/{doc.question}/{doc.filename}[/yellow]")
            for section in doc.missing_recommended:
                console.print(f"  - Missing: {section}")
        console.print()


def main() -> None:
    """Main entry point."""
    console = Console()

    # Determine docs path
    docs_path = DEFAULT_DOCS_PATH

    if not docs_path.exists():
        console.print(f"[red]Error: Documentation path not found: {docs_path}[/red]")
        return

    # Run analysis
    result = analyze_directory(docs_path)

    # Print report
    print_analysis_report(result, console)


if __name__ == "__main__":
    main()
