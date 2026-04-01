# Development Guide

## Package Manager

This project uses **Yarn 1.22.x** as the package manager.

### Why Yarn?

- ✅ Proven compatibility with React Native ecosystem
- ✅ Stable support for native dependencies (iOS Pods, Android)
- ✅ Works seamlessly with react-native-builder-bob
- ✅ Reliable monorepo/workspace support
- ✅ Consistent lockfile format for CI/CD

### About Bun

As of January 2026, we evaluated migrating to [Bun](https://bun.sh) but found it **not yet feasible** for React Native library development. See [BUN_MIGRATION_ANALYSIS.md](./BUN_MIGRATION_ANALYSIS.md) for details.

**Key issues:**
- Critical bugs in package installation with React Native packages
- Immature React Native ecosystem integration
- Incompatibility with react-native-builder-bob workflows
- No significant benefits over Yarn for this use case

**We will re-evaluate Bun in 6-12 months** when React Native support matures.

## Getting Started

### Prerequisites

- Node.js 22.13.1 (as specified in `.nvmrc`)
- Yarn 1.22.x or higher
- For iOS development: CocoaPods

### Installation

```bash
# Install dependencies (root + example + docs)
yarn bootstrap

# Or install individually
yarn install                    # Main library
yarn install --cwd example      # Example app
yarn install --cwd docusaurus   # Documentation site
```

## Development Scripts

### Main Library

```bash
# Run tests
yarn test              # Run all tests once
yarn test-watch        # Run tests in watch mode

# Code quality
yarn lint              # Run ESLint
yarn typecheck         # Run TypeScript type checking

# Build library
yarn prepare           # Full build (runs on install)
yarn prepack           # Build before publishing
```

### Example App

```bash
# Start development server
yarn example start

# Run on specific platforms
yarn example ios
yarn example android
yarn example web
```

### Documentation

```bash
# Start documentation site locally
cd docusaurus
yarn start

# Build documentation
yarn build
```

## Build System

This project uses [react-native-builder-bob](https://github.com/callstack/react-native-builder-bob) to compile the library.

**Output formats:**
- CommonJS (`lib/commonjs/`)
- ES Modules (`lib/module/`)
- TypeScript declarations (`lib/typescript/`)

**Configuration:** See `react-native-builder-bob` field in `package.json`

## Testing

We use Jest with React Native preset for testing.

```bash
# Run all tests with coverage
yarn test

# Run specific test file
yarn test DatePicker.test.tsx

# Update snapshots
yarn test -u
```

**Test coverage:** Reports are generated in `coverage/` directory.

## Linting & Formatting

- **Linter:** ESLint with React Native Community config
- **Formatter:** Prettier (integrated with ESLint)
- **Pre-commit hooks:** Husky runs lint + typecheck before commit

```bash
# Lint all files
yarn lint

# Auto-fix issues
yarn lint --fix

# Type check
yarn typecheck
```

## CI/CD

GitHub Actions workflows run on every PR:

- ✅ Lint check
- ✅ Type check  
- ✅ Unit tests
- ✅ Build verification
- 📚 Documentation deployment (on merge to main)

See `.github/workflows/` for workflow definitions.

## Release Process

We use [release-it](https://github.com/release-it/release-it) for automated releases:

```bash
# Create a new release (maintainers only)
yarn release
```

This will:
1. Run tests and build
2. Bump version using conventional commits
3. Generate changelog
4. Create git tag
5. Push to GitHub
6. Publish to npm
7. Create GitHub release

## Project Structure

```
react-native-paper-dates/
├── src/                    # Library source code
│   ├── Date/              # Date picker components
│   ├── Time/              # Time picker components
│   └── index.tsx          # Main exports
├── lib/                   # Compiled output (gitignored)
├── example/               # Example app (Expo)
├── docusaurus/            # Documentation site
├── scripts/               # Build and utility scripts
└── .github/               # CI/CD workflows
```

## Troubleshooting

### Clean Build

```bash
# Clean all build artifacts and dependencies
rm -rf node_modules lib
rm -rf example/node_modules
rm -rf docusaurus/node_modules
yarn install
```

### iOS Pod Issues

```bash
# Clean and reinstall pods
cd example/ios
rm -rf Pods Podfile.lock
cd ../..
yarn pods
```

### Type Errors

If TypeScript shows errors after pulling changes:

```bash
# Rebuild library types
yarn prepare
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`yarn test && yarn lint`)
5. Commit your changes (conventional commits format)
6. Push to your fork
7. Open a Pull Request

## License

MIT - See [LICENSE](./LICENSE) file for details.
