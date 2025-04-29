import { SnpshtConfig, SitemapURL } from '../types/index.js';
import { Logger } from '../utils/logger.js';
import { readFile } from 'fs/promises';
import { XMLParser } from 'fast-xml-parser';
import path from 'path';

export class SitemapParser {
  private config: SnpshtConfig;
  private logger: Logger;
  
  constructor(config: SnpshtConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }
  
  /**
   * Parse a sitemap and extract URLs
   */
  async parse(sitemapUrl: string): Promise<SitemapURL[]> {
    this.logger.info(`Parsing sitemap: ${sitemapUrl}`);
    
    // Determine if it's a local file or URL
    let sitemapContent: string;
    
    if (sitemapUrl.startsWith('http://') || sitemapUrl.startsWith('https://')) {
      sitemapContent = await this.fetchUrl(sitemapUrl);
    } else {
      // Treat as a local file path
      const filePath = path.isAbsolute(sitemapUrl) 
        ? sitemapUrl 
        : path.join(process.cwd(), sitemapUrl);
      
      sitemapContent = await readFile(filePath, 'utf8');
    }
    
    // Parse XML
    return this.parseXml(sitemapContent);
  }
  
  /**
   * Fetch content from a URL
   */
  private async fetchUrl(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sitemap: ${response.status}`);
      }
      
      return await response.text();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error fetching sitemap: ${errorMessage}`);
      throw error;
    }
  }
  
  /**
   * Parse XML sitemap content
   */
  private parseXml(xml: string): SitemapURL[] {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        isArray: (name) => name === 'url'
      });
      
      const result = parser.parse(xml);
      
      // Handle standard sitemap
      if (result.urlset && result.urlset.url) {
        const urls = Array.isArray(result.urlset.url) 
          ? result.urlset.url 
          : [result.urlset.url];
        
        return urls.map((url: any) => ({
          loc: url.loc,
          lastmod: url.lastmod,
          changefreq: url.changefreq,
          priority: url.priority
        }));
      }
      
      // Handle sitemap index
      if (result.sitemapindex && result.sitemapindex.sitemap) {
        this.logger.info('Found sitemap index, will need to parse child sitemaps');
        
        // In a real implementation, you would recursively parse child sitemaps
        // For simplicity, we'll just extract the URLs
        const sitemaps = Array.isArray(result.sitemapindex.sitemap)
          ? result.sitemapindex.sitemap
          : [result.sitemapindex.sitemap];
        
        throw new Error('Sitemap index found. Please use one of the child sitemaps instead: ' + 
          sitemaps.map((s: any) => s.loc).join(', '));
      }
      
      // Handle unexpected format
      throw new Error('Unrecognized sitemap format');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error parsing sitemap XML: ${errorMessage}`);
      throw error;
    }
  }
}
