# Taiz - Polyglot Package Manager

A CLI tool that works as a polyglot package manager for developers, supporting multiple programming languages in a single project.

## Features

- **Multi-language support**: Automatically detects and manages Node.js, Python, Rust, and Go projects
- **Unified interface**: Single CLI for all your package management needs
- **Project detection**: Automatically detects project types by scanning for language-specific files
- **Lockfile support**: Reproducible installs with `taiz-lock.yaml`
- **Development workflows**: Built-in dev server and build commands
- **Cross-platform**: Works on Windows, macOS, and Linux

## Installation

### Development Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Link globally for development:
   ```bash
   npm link
   ```

### Production Installation

**Windows:**
```bash
winget install YourName.Taiz
```

**macOS:**
```bash
# From Homebrew core (after acceptance)
brew install taiz

# From custom tap (immediate)
brew tap t4zn/taiz
brew install taiz
```

**Linux/Other:**
```bash
npm install -g taiz
```

**Manual Installation:**
Download the latest release from [GitHub Releases](https://github.com/t4zn/taiz-cli/releases)

## Usage

### Initialize a Project

```bash
taiz init
```

Creates `taiz.yaml` and `taiz-lock.yaml` files, automatically detecting existing project types.

### Install Dependencies

```bash
# Install all dependencies from taiz.yaml
taiz install
# or
taiz i

# Install a specific module
taiz install express
taiz i lodash

# Install globally
taiz install --global some-tool
```

### Remove Dependencies

```bash
taiz uninstall express
```

### Development Commands

```bash
# Start development server
taiz dev

# Build project
taiz build

# Run custom scripts
taiz run test
```

## Project Detection

Taiz automatically detects project types by scanning for:

- **Node.js**: `package.json`
- **Python**: `requirements.txt`, `pyproject.toml`, `setup.py`
- **Rust**: `Cargo.toml`
- **Go**: `go.mod`

## Configuration Files

### taiz.yaml

Main configuration file storing project metadata and dependencies:

```yaml
name: my-project
version: 1.0.0
description: My awesome project
dependencies:
  node:
    express: ^4.18.0
  python:
    flask: ^2.2.0
scripts:
  dev: taiz dev
  test: npm test
projectTypes:
  - node
  - python
```

### taiz-lock.yaml

Lockfile with exact versions and integrity checks:

```yaml
version: 1.0.0
lockfileVersion: 1
dependencies:
  node:
    express:
      version: 4.18.2
      resolved: https://registry.npmjs.org/express/-/express-4.18.2.tgz
      integrity: sha512-5/PsL6iGPdfQ/lKM1UuielYgv3BUoJfz1aUwU9vHZ+J7gyvwdQXFEBIEIaxeGf0GIcreATNyBExtalisDbuMqQ==
      projectType: node
```

## Commands

| Command | Description |
|---------|-------------|
| `taiz init` | Initialize a new project |
| `taiz install` / `taiz i` | Install all dependencies from taiz.yaml |
| `taiz install <module>` / `taiz i <module>` | Install a specific dependency |
| `taiz uninstall <module>` | Remove a dependency |
| `taiz dev` | Start development server |
| `taiz build` | Build the project |
| `taiz run <script>` | Run a custom script |
| `taiz --help` | Show help |
| `taiz --version` | Show version |

## Architecture

```
taiz/
├── bin/taiz.js         # CLI entry point
├── src/
│   ├── commands/       # Command implementations
│   │   ├── init.js
│   │   ├── install.js
│   │   ├── uninstall.js
│   │   ├── dev.js
│   │   ├── build.js
│   │   └── run.js
│   ├── config.js       # Configuration management
│   ├── detector.js     # Project type detection
│   └── installer.js    # Package installation logic
├── examples/           # Example configuration files
└── package.json
```

## Development

### Prerequisites

- Node.js 14+
- npm or yarn

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Link globally: `npm link`
4. Test in any project: `taiz --help`

### Testing

Create a test project and try the commands:

```bash
mkdir test-project
cd test-project
echo '{"name": "test"}' > package.json
taiz init
taiz install lodash
taiz dev
```

## Roadmap

- [ ] Enhanced security scanning
- [ ] Plugin system
- [ ] More language support (Java, C#, etc.)
- [ ] Dependency conflict resolution
- [ ] Integration with CI/CD systems
- [ ] Web dashboard for project management

## Publishing

Want to publish taiz to package managers? See our guides:

- **[Quick Start Guide](QUICK_START.md)** - Fast track to publishing
- **[Complete Publishing Guide](PUBLISHING_GUIDE.md)** - Detailed step-by-step instructions for Winget

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
