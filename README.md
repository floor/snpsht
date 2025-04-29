# snpsht

[![npm version](https://img.shields.io/npm/v/snpsht.svg)](https://www.npmjs.com/package/snpsht)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A simple, fast tool for generating static snapshots of JavaScript web applications using a sitemap.xml file. This is particularly useful for SEO purposes, prerendering JavaScript-heavy websites for search engines, or creating static backups of dynamic content.

## Features

- Parse sitemap.xml to find all URLs to snapshot
- Render pages with full JavaScript execution using Playwright
- Save fully-rendered HTML for serving to search engines
- Configurable wait conditions to ensure content is loaded
- Concurrent processing for faster snapshots
- Simple CLI and programmatic API
- Detailed output with success/failure statistics

## Installation

```bash
# Install globally
npm install -g snpsht

# Or install locally in your project
npm install --save-dev snpsht
```

## Quick Start

### Command Line Usage

Generate snapshots for all URLs in a sitemap:

```bash
snpsht generate --base-url https://example.com --sitemap https://example.com/sitemap.xml --out-dir ./snapshots
```

With additional options:

```bash
snpsht generate \
  --base-url https://example.com \
  --sitemap https://example.com/sitemap.xml \
  --out-dir ./snapshots \
  --concurrency 8 \
  --wait .main-content .footer \
  --timeout 60000 \
  --additional-wait 2000 \
  --network-idle \
  --pretty \
  --metadata \
  --verbose
```

### Programmatic Usage

```javascript
import Snpsht from 'snpsht';

async function generateSnapshots() {
  const snpsht = new Snpsht({
    baseUrl: 'https://example.com',
    sitemapUrl: 'https://example.com/sitemap.xml',
    outDir: './snapshots',
    concurrency: 4,
    waitForSelectors: ['.main-content', '.footer'],
    timeout: 30000,
    additionalWaitMs: 1000,
    waitForNetworkIdle: true,
    prettyHtml: true,
    includeMetadata: true,
    verbose: true
  });
  
  try {
    const result = await snpsht.generate();
    console.log(`Total URLs: ${result.total}`);
    console.log(`Successful: ${result.success}`);
    console.log(`Failed: ${result.failed}`);
  } catch (error) {
    console.error('Error generating snapshots:', error);
  } finally {
    // Always close to release resources
    await snpsht.close();
  }
}

generateSnapshots();
```

## Command Line Options

| Option | Description |
|--------|-------------|
| `-b, --base-url <url>` | Base URL of the website (required) |
| `-s, --sitemap <path>` | Path or URL to sitemap.xml (required) |
| `-o, --out-dir <path>` | Output directory for snapshots (required) |
| `-c, --concurrency <number>` | Number of pages to process concurrently (default: 4) |
| `-w, --wait <selectors...>` | CSS selectors to wait for before capturing |
| `-t, --timeout <ms>` | Page load timeout in milliseconds (default: 30000) |
| `-a, --additional-wait <ms>` | Additional wait time after page load (default: 0) |
| `-n, --network-idle` | Wait for network to be idle before capturing |
| `-p, --pretty` | Prettify HTML output |
| `-m, --metadata` | Include metadata with snapshots |
| `-v, --verbose` | Enable verbose logging |

## Configuration Options

When using the programmatic API, the following configuration options are available:

| Option | Type | Description |
|--------|------|-------------|
| `baseUrl` | string | Base URL of the website |
| `sitemapUrl` | string | Path or URL to sitemap.xml |
| `outDir` | string | Output directory for snapshots |
| `concurrency` | number | Number of pages to process concurrently (default: 4) |
| `waitForSelectors` | string[] | CSS selectors to wait for before capturing |
| `timeout` | number | Page load timeout in milliseconds (default: 30000) |
| `additionalWaitMs` | number | Additional wait time after page load in milliseconds |
| `waitForNetworkIdle` | boolean | Wait for network to be idle before capturing |
| `prettyHtml` | boolean | Prettify HTML output |
| `includeMetadata` | boolean | Include metadata with snapshots |
| `verbose` | boolean | Enable verbose logging |
| `logFile` | string | Path to a log file |
| `userAgent` | string | Custom user agent string |
| `viewport` | object | Custom viewport size (e.g., `{ width: 1280, height: 720 }`) |

## Output Format

Each captured page is saved as an HTML file in the specified output directory. The file path preserves the URL structure.

For example:
- `https://example.com/` → `./snapshots/index.html`
- `https://example.com/about` → `./snapshots/about.html`
- `https://example.com/blog/post-1` → `./snapshots/blog/post-1.html`

If the `metadata` option is enabled, additional `.meta.json` files will be created with information about each snapshot.

## Use Cases

### SEO Optimization

Generate static HTML snapshots that can be served to search engine bots:

```bash
snpsht generate --base-url https://example.com --sitemap https://example.com/sitemap.xml --out-dir ./public/snapshots --network-idle
```

### Content Archiving

Create a static backup of your dynamic website:

```bash
snpsht generate --base-url https://example.com --sitemap https://example.com/sitemap.xml --out-dir ./archive/$(date +%Y-%m-%d) --pretty --metadata
```

### Headless Testing

Generate snapshots to compare before/after changes:

```bash
snpsht generate --base-url https://staging.example.com --sitemap https://staging.example.com/sitemap.xml --out-dir ./snapshots/staging
```

## Requirements

- Node.js 16.0.0 or higher
- Bun 1.0.0 or higher

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.