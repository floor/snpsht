# snpsht

[![npm version](https://img.shields.io/npm/v/snpsht.svg)](https://www.npmjs.com/package/snpsht)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/floor/snpsht/actions/workflows/ci.yml/badge.svg)](https://github.com/floor/snpsht/actions/workflows/ci.yml)

A simple, fast tool for generating static snapshots of JavaScript web applications using a sitemap.xml file.

## Features

- Parse sitemap.xml to find all URLs to snapshot
- Render pages with full JavaScript execution using Playwright
- Save fully-rendered HTML for serving to search engines
- Configurable wait conditions to ensure content is loaded
- Concurrent processing for faster snapshots
- Simple CLI and programmatic API

## Installation

```bash
# Install globally
npm install -g snpsht

# Or install locally in your project
npm install --save-dev snpsht