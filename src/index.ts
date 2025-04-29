import { SnpshtConfig, SnpshtResult, SitemapURL } from './types/index.js';
import { SitemapParser } from './sitemap/index.js';
import { PageRenderer } from './renderer/index.js';
import { Storage } from './storage/index.js';
import { Logger } from './utils/logger.js';
import { defaultConfig } from './config/index.js';

export class Snpsht {
  private config: SnpshtConfig;
  private logger: Logger;
  private renderer: PageRenderer;
  private storage: Storage;
  private parser: SitemapParser;
  
  constructor(config: Partial<SnpshtConfig>) {
    this.config = { ...defaultConfig, ...config };
    this.logger = new Logger(this.config.verbose, this.config.logFile);
    this.renderer = new PageRenderer(this.config, this.logger);
    this.storage = new Storage(this.config, this.logger);
    this.parser = new SitemapParser(this.config, this.logger);
  }
  
  /**
   * Generate snapshots for all URLs in the sitemap
   */
  async generate(): Promise<{
    total: number;
    success: number;
    failed: number;
    results: SnpshtResult[];
  }> {
    this.logger.info('Starting snapshot generation');
    
    // Parse the sitemap to get URLs
    const urls = await this.parser.parse(this.config.sitemapUrl);
    
    this.logger.info(`Found ${urls.length} URLs in sitemap`);
    
    // Initialize browser
    await this.renderer.initialize();
    
    // Track results
    const results: SnpshtResult[] = [];
    let success = 0;
    let failed = 0;
    
    // Process in batches for concurrency control
    const concurrency = this.config.concurrency || 4;
    const batches = this.chunkArray(urls, concurrency);
    
    for (const batch of batches) {
      const batchPromises = batch.map(async (sitemapUrl) => {
        const url = sitemapUrl.loc;
        const result: SnpshtResult = {
          url,
          filePath: this.storage.getFilePath(url),
          success: false
        };
        
        try {
          this.logger.info(`Processing ${url}`);
          
          // Render the page
          const html = await this.renderer.renderPage(url);
          
          // Extract metadata if needed
          if (this.config.includeMetadata) {
            result.metadata = {
              timestamp: Date.now(),
              size: html.length,
              // Title could be extracted from the HTML if needed
            };
          }
          
          // Save the snapshot
          await this.storage.saveSnapshot(url, html, result.metadata);
          
          result.success = true;
          success++;
          
          this.logger.info(`Successfully generated snapshot for ${url}`);
        } catch (error) {
          result.success = false;
          result.error = error instanceof Error ? error.message : String(error);
          failed++;
          
          this.logger.error(`Error generating snapshot for ${url}: ${result.error}`);
        }
        
        results.push(result);
        return result;
      });
      
      await Promise.all(batchPromises);
    }
    
    // Close browser
    await this.renderer.close();
    
    this.logger.info('Snapshot generation completed');
    this.logger.info(`Results: ${success} successful, ${failed} failed`);
    
    return {
      total: urls.length,
      success,
      failed,
      results
    };
  }
  
  /**
   * Release all resources
   */
  async close(): Promise<void> {
    await this.renderer.close();
  }
  
  /**
   * Split array into chunks for concurrency
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Export default and named exports
export default Snpsht;
export * from './types/index.js';