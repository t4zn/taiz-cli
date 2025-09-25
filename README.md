# Taiz CLI – Polyglot Package Manager

`taiz` is a developer-friendly, polyglot package manager that allows you to manage dependencies for multiple languages (Node.js, Python, and more) with a single CLI. It works globally or per-project, generating unified lockfiles for reproducible installs.

---

## Features

- **Polyglot support**: Detects project type automatically (Node, Python) and installs dependencies in the correct ecosystem.
- **Unified lockfile**: Maintains a single `taiz-lock.yaml` for reproducible installs across all languages.
- **Project-local & global installs**: Installs dependencies locally in the project, or globally if no project is detected.
- **Dev workflow support**: Run project dev servers automatically based on language.
- **Cross-platform**: Works on Windows, macOS, and Linux.

---

## Installation

```powershell
winget install Taiz.CLI
brew install taiz
