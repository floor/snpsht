#!/usr/bin/env node
import { Command } from 'commander';
import Snpsht from './index.js';
import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

// Get package version from package.json
let version = '0.1.0'; // Default version
try {
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  version = packageJson.version;
} catch (e) {
  console.warn('Could not read package.json');
}

program
  .name('snpsht')
  .description('Generate static snapshots from a sitemap.xml')
  .version(version);

program
  .command('generate')
  .description('Generate snapshots for all URLs in a sitemap')
  .requiredOption('-b, --base-url <url>', 'Base URL of the website')
  .requiredOption('-s, --sitemap <path>', 'Path or URL to sitemap.xml')
  .requiredOption('-o, --out-dir <path>', 'Output directory for snapshots')
  .option('-c, --concurrency <number>', 'Number of pages to process concurrently', '4')
  .option('-w, --wait <selectors...>', 'CSS selectors to wait for')
  .option('-t, --timeout <ms>', 'Page load timeout in milliseconds', '30000')
  .option('-a, --additional-wait <ms>', 'Additional wait time after page load', '0')
  .option('-n, --network-idle', 'Wait for network to be idle')
  .option('-p, --pretty', 'Prettify HTML output')
  .option('-m, --metadata', 'Include metadata with snapshots')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async (options) => {
    try {
      console.log('Starting snapshot generation...');
      
      const snpsht = new Snpsht({
        baseUrl: options.baseUrl,
        sitemapUrl: options.sitemap,
        outDir: options.outDir,
        concurrency: parseInt(options.concurrency, 10),
        waitForSelectors: options.wait,
        timeout: parseInt(options.timeout, 10),
        additionalWaitMs: parseInt(options.additionalWait, 10),
        waitForNetworkIdle: options.networkIdle,
        prettyHtml: options.pretty,
        includeMetadata: options.metadata,
        verbose: options.verbose
      });
      
      const result = await snpsht.generate();
      
      console.log('\nSnapshot generation complete!');
      console.log(`Total URLs: ${result.total}`);
      console.log(`Successful: ${result.success}`);
      console.log(`Failed: ${result.failed}`);
      
      // Close resources
      await snpsht.close();
      
      if (result.failed > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error('Error generating snapshots:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse(process.argv);