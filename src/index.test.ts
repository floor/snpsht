import { describe, test, expect, beforeAll, afterAll, mock } from 'bun:test';
import Snpsht from './index.js';

// Mock dependencies to avoid actual browser launches
mock.module('./renderer/index.js', () => {
  return {
    PageRenderer: class MockPageRenderer {
      initialize = () => Promise.resolve();
      renderPage = () => Promise.resolve('<html><body>Test content</body></html>');
      close = () => Promise.resolve();
    }
  };
});

mock.module('./sitemap/index.js', () => {
  return {
    SitemapParser: class MockSitemapParser {
      parse = () => Promise.resolve([
        { loc: 'https://example.com/' },
        { loc: 'https://example.com/about' }
      ]);
    }
  };
});

// Don't actually write files in tests
mock.module('./storage/index.js', () => {
  return {
    Storage: class MockStorage {
      getFilePath = (url: string) => `/mock/path/${url}.html`;
      saveSnapshot = () => Promise.resolve();
    }
  };
});

describe('Snpsht', () => {
  test('should initialize with config', () => {
    const snpsht = new Snpsht({
      baseUrl: 'https://example.com',
      sitemapUrl: 'https://example.com/sitemap.xml',
      outDir: './snapshots'
    });
    
    expect(snpsht).toBeDefined();
  });
  
  test('should generate snapshots', async () => {
    const snpsht = new Snpsht({
      baseUrl: 'https://example.com',
      sitemapUrl: 'https://example.com/sitemap.xml',
      outDir: './snapshots'
    });
    
    const result = await snpsht.generate();
    
    expect(result.total).toBe(2);
    expect(result.success).toBe(2);
    expect(result.failed).toBe(0);
  });
});