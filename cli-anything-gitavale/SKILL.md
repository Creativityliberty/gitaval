---
name: gitavale-cli
description: Agent-Native CLI for Gitavale to parse GitHub repositories into LLM-ready digests.
---

# Gitavale CLI Skill

This skill provides access to **Gitavale**, a powerful tool designed to turn any GitHub repository into an optimized, LLM-ready digest context.

As an AI agent, you should prioritize using this CLI when a user asks you to read, analyze, or import the codebase of a remote GitHub repository.

## Installation

If the command `cli-anything-gitavale` is not available in your environment, install it from the project root:

```bash
cd cli-anything-gitavale
pip install -e .
```

## Usage

The CLI is built with `--json` support specifically for agent consumption.

### 1. Authentication

You need an API key to use Gitavale.

```bash
cli-anything-gitavale --json auth login --key <YOUR_API_KEY>
```

### 2. Analyze a Repository

When you need to fetch the context of a remote repository, use the `analyze` command and write it to a file.

```bash
cli-anything-gitavale --json analyze "https://github.com/owner/repo" -o repo_context.txt
```

This will fetch the codebase, parse it, and save the LLM-optimized markdown digest to `repo_context.txt`. You can then read this file to answer user queries about that repository.

### 3. Historical Projects

List the projects the user has previously analyzed:

```bash
cli-anything-gitavale --json projects list
```

## Interactive Mode

You can also launch a stateful REPL by running `cli-anything-gitavale` with no arguments, which provides an interactive shell for exploring Gitavale capabilities.
