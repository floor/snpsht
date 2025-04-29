export interface SnpshtConfig {
  // Core configuration
  baseUrl: string;             
  outDir: string;              
  
  // Sitemap configuration
  sitemapUrl: string;          
  
  // Renderer configuration
  waitForSelectors?: string[]; 
  waitForNetworkIdle?: boolean;
  additionalWaitMs?: number;   
  timeout?: number;            
  userAgent?: string;          
  viewport?: {                 
    width: number;
    height: number;
  };
  
  // Output options
  prettyHtml?: boolean;        
  includeMetadata?: boolean;   
  
  // Processing options
  concurrency?: number;        
  
  // Advanced options
  verbose?: boolean;           
  logFile?: string;            
}

export interface SnpshtResult {
  url: string;                 
  filePath: string;            
  success: boolean;            
  error?: string;              
  metadata?: {
    title?: string;            
    timestamp: number;         
    size: number;              
  };
}

export interface SitemapURL {
  loc: string;                 
  lastmod?: string;            
  changefreq?: string;         
  priority?: number;           
}