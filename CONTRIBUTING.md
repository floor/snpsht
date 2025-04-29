# Contributing to snpsht

Thank you for considering contributing to snpsht! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project.

## How to Contribute

1. Fork the repository
2. Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests to ensure your changes do not break existing functionality
5. Commit your changes with clear, descriptive messages
6. Push to your fork
7. Submit a pull request to the main repository

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the documentation as needed
3. The PR should work with the existing tests and add new tests if applicable
4. PRs will be merged once reviewed and approved

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/snpsht.git
cd snpsht

# Install dependencies
bun install

# Build
bun run build

# Test
bun test