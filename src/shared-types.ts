// Shared type definitions for the grocery scraper extension

interface StoreConfig {
  name: string;
  buildUrl: (term: string) => string;
  tabId: number | null;
  shouldClose: boolean;
}

interface StoreSettings {
  [storeKey: string]: {
    enabled: boolean;
    closeTab: boolean;
  };
}

interface SearchMessage {
  action: 'search';
  term: string;
  settings: StoreSettings;
}

interface Product {
  name: string;
  price: string;
  image: string;
  discount: boolean;
  sale: boolean;
  salesDesc: string;
}

interface SearchResult {
  name: string;
  products: Product[];
  searchUrl?: string;
  error?: string;
  isLoading?: boolean;
}

interface FieldConfig {
  selector?: string | null;
  condition?: (element: Element | null) => boolean;
}

interface StoreScrapingConfig {
  name: string;
  productSelector: string;
  fields: {
    name: string | null;
    price: string | null;
    image: string | null;
    discount: FieldConfig;
    sale: FieldConfig;
    salesDesc: string | null;
  };
  priceParser: (priceElement: Element | null, container?: Element) => string;
  nameExtractor?: (container: Element) => string;
  imageExtractor?: (container: Element) => string;
  maxRetries: number;
  retryInterval: number;
}

interface ScrapingConfigs {
  [storeKey: string]: StoreScrapingConfig;
}

type StoreKey = 'kroger' | 'meijer' | 'aldi' | 'walmart' | 'costco';