# TiltCheck Project Structure

This document describes the organized structure of the TiltCheck repository.

## Root Directory

Essential files only:
- `README.md` - Main project documentation
- `package.json` - Project dependencies and scripts
- `.gitignore` - Git ignore rules
- `bot.js` - Main Discord bot entry point
- `index.js` - Alternative entry point
- `index.html` - Main web interface

## Directory Structure

```
TiltCheck/
├── src/                          # Source code
│   ├── bot/                      # Discord bot modules
│   ├── lib/                      # Core libraries and integrations
│   ├── services/                 # Backend services (OAuth, webhooks, servers)
│   ├── utils/                    # Utility functions (validation, debugging)
│   └── api/                      # API endpoints and handlers
│
├── scripts/                      # Shell scripts
│   ├── deployment/               # Deployment scripts
│   ├── setup/                    # Setup and installation scripts
│   └── testing/                  # Testing scripts
│
├── tests/                        # Test files
│
├── docs/                         # Documentation
│   ├── guides/                   # User guides
│   ├── deployment/               # Deployment documentation
│   ├── integration/              # Integration guides
│   └── api/                      # API documentation
│
├── config/                       # Configuration files
│
├── public/                       # Static files (HTML, CSS)
│
├── commands/                     # Discord bot commands
│
├── helpers/                      # Helper modules
│
├── utils/                        # Shared utilities
│
├── events/                       # Event handlers
│
├── webhooks/                     # Webhook handlers
│
├── data/                         # Data files
│
├── webapp/                       # Next.js web application
│
├── extension-screen-reader/      # Browser extension
│
├── tiltcheck-organized/          # Legacy organized structure (to be merged)
│
└── integrations/                 # Third-party integrations

```

## Key Files by Purpose

### Entry Points
- `bot.js` - Main Discord bot
- `index.js` - Alternative entry point
- `main.js` - Complete system entry

### Core Bot Files (src/bot/)
- Discord bot implementation files
- Bot-specific logic and handlers

### Libraries (src/lib/)
- `*Integration.js` - Third-party integrations
- `*Manager.js` - Resource managers
- `*System.js` - System components
- `tiltCheck*.js` - TiltCheck core modules

### Services (src/services/)
- `*server*.js` - Server implementations
- `*OAuth*.js` - OAuth handlers
- `*webhook*.js` - Webhook handlers

### Utilities (src/utils/)
- `validate*.js` - Validation utilities
- `check*.js` - Health check utilities
- `debug*.js` - Debugging tools

### Scripts
- `scripts/deployment/` - Deploy scripts (deploy-*.sh)
- `scripts/setup/` - Setup scripts (setup-*.sh)
- `scripts/testing/` - Test runner scripts

### Tests
- All test files in `tests/` directory
- Pattern: `test*.js`, `*test*.js`

## Configuration Files

Configuration files are organized in the `config/` directory:
- JSON configuration files
- Manifest files
- Non-sensitive config templates

## Documentation

All documentation is in the `docs/` directory:
- Guides and tutorials
- API documentation
- Deployment instructions
- Integration guides

## Web Applications

### Main Webapp (webapp/)
Next.js application with:
- `/app` - Application pages
- `/components` - React components
- `/public` - Static assets

### Browser Extension (extension-screen-reader/)
Chrome extension files:
- `manifest.json` - Extension manifest
- `background.js` - Background script
- `popup.js` - Popup interface
- `content-script.js` - Content script

## Data Management

- `data/` - Runtime data files (JSON)
- Sensitive data excluded via .gitignore
- Example: `user_data.json`, `loans.json`

## Migration Notes

The repository was reorganized from a flat structure with:
- 135+ markdown files in root → consolidated in `docs/`
- 166+ JS files in root → organized by purpose in `src/`
- 57+ shell scripts → organized in `scripts/`
- All duplicates removed

## Development Workflow

1. Source code changes go in `src/`
2. New tests go in `tests/`
3. Documentation updates go in `docs/`
4. Scripts for automation go in `scripts/`
5. Keep root directory clean with only essential files
