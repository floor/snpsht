import { SnpshtConfig } from '../types/index.js';

export const defaultConfig: SnpshtConfig = {
  baseUrl: '',
  outDir: './snapshots',
  sitemapUrl: '',
  waitForNetworkIdle: true,
  timeout: 30000,
  concurrency: 4,
  prettyHtml: false,
  includeMetadata: true,
  verbose: false
};