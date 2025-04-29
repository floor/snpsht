import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { SnpshtConfig } from '../types/index.js';
import { Logger } from '../utils/logger.js';

export class Storage {
  private config: SnpshtConfig;
  private logger: Logger;
  
  constructor(config: SnpshtConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }
  
  /**
   * Get the file path for a URL
   */
  getFilePath(url: string): string {
    // Parse the URL to get the path component
    let urlPath: string;
    
    try {
      // Handle full URLs
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const parsedUrl = new URL(url);
        urlPath = parsedUrl.pathname;
      } else {
        // Handle relative URLs
        urlPath = url.startsWith('/') ? url : `/${url}`;
      }
    } catch (error) {
      // If URL parsing fails, use the url as-is
      urlPath = url;
    }
    
    // Normalize path for filesystem
    // Handle root path
    if (urlPath === '/') {
      urlPath = '/index';
    }
    
    // Remove trailing slash if present
    if (urlPath.endsWith('/')) {
      urlPath = urlPath.slice(0, -1);
    }
    
    // Add .html extension
    const filePath = `${urlPath}.html`;
    
    // Join with output directory
    return path.join(this.config.outDir, filePath);
  }
  
  /**
   * Save a snapshot to the file system
   */
  async saveSnapshot(url: string, html: string, metadata?: any): Promise<void> {
    const filePath = this.getFilePath(url);
    
    // Ensure directory exists
    await this.ensureDirectory(path.dirname(filePath));
    
    // Pretty format HTML if configured
    const formattedHtml = this.config.prettyHtml
      ? this.prettifyHtml(html)
      : html;
    
    // Save the HTML
    await writeFile(filePath, formattedHtml, 'utf8');
    
    // Save metadata if configured
    if (this.config.includeMetadata && metadata) {
      const metaPath = `${filePath}.meta.json`;
      await writeFile(metaPath, JSON.stringify({
        url,
        timestamp: Date.now(),
        ...metadata
      }, null, 2), 'utf8');
    }
    
    this.logger.info(`Saved snapshot to ${filePath}`);
  }
  
  /**
   * Ensure directory exists
   */
  private async ensureDirectory(dir: string): Promise<void> {
    try {
      await mkdir(dir, { recursive: true });
    } catch (error) {
      this.logger.error(`Error creating directory ${dir}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Basic HTML prettifier
   */
  private prettifyHtml(html: string): string {
    // This is a very simple implementation
    // In a real project, you might use a library like js-beautify
    return html
      .replace(/>\s+</g, '>\n<')
      .replace(/(<div.*?>|<\/div>|<p>|<\/p>|<section.*?>|<\/section>)/g, '$1\n');
  }
}