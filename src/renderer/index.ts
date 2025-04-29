import * as playwright from 'playwright';
import { SnpshtConfig } from '../types/index.js';
import { Logger } from '../utils/logger.js';

export class PageRenderer {
  private config: SnpshtConfig;
  private logger: Logger;
  private browser: playwright.Browser | null = null;
  
  constructor(config: SnpshtConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }
  
  /**
   * Initialize the browser
   */
  async initialize(): Promise<void> {
    if (!this.browser) {
      this.logger.info('Initializing browser');
      this.browser = await playwright.chromium.launch({
        headless: true
      });
    }
  }
  
  /**
   * Render a web page and return the HTML
   */
  async renderPage(url: string): Promise<string> {
    if (!this.browser) {
      await this.initialize();
    }
    
    this.logger.info(`Rendering page: ${url}`);
    
    const context = await this.browser!.newContext({
      viewport: this.config.viewport || { width: 1280, height: 720 },
      userAgent: this.config.userAgent
    });
    
    const page = await context.newPage();
    
    try {
      // Ensure the URL has http/https
      const fullUrl = this.ensureFullUrl(url);
      
      // Navigate to the page
      await page.goto(fullUrl, {
        waitUntil: this.config.waitForNetworkIdle ? 'networkidle' : 'load',
        timeout: this.config.timeout || 30000
      });
      
      // Wait for selectors if specified
      if (this.config.waitForSelectors && this.config.waitForSelectors.length > 0) {
        for (const selector of this.config.waitForSelectors) {
          this.logger.info(`Waiting for selector: ${selector}`);
          await page.waitForSelector(selector, {
            state: 'visible',
            timeout: this.config.timeout || 30000
          });
        }
      }
      
      // Wait additional time if specified
      if (this.config.additionalWaitMs) {
        this.logger.info(`Waiting additional ${this.config.additionalWaitMs}ms`);
        await page.waitForTimeout(this.config.additionalWaitMs);
      }
      
      // Get the HTML content
      const html = await page.content();
      
      return html;
    } catch (error) {
      this.logger.error(`Error rendering page ${url}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      await page.close();
      await context.close();
    }
  }
  
  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.logger.info('Browser closed');
    }
  }
  
  /**
   * Ensure URL has the base URL if it's a relative path
   */
  private ensureFullUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    const baseUrl = this.config.baseUrl.endsWith('/')
      ? this.config.baseUrl.slice(0, -1)
      : this.config.baseUrl;
      
    const path = url.startsWith('/') ? url : `/${url}`;
    
    return `${baseUrl}${path}`;
  }
}