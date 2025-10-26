export interface StoreConfig {
  name: string;
  buildUrl: (term: string) => string;
  tabId: number | null;
  shouldClose: boolean;
}

export interface StoreSettings {
  [storeKey: string]: {
    enabled: boolean;
    closeTab: boolean;
  };
}

export interface SearchMessage {
  action: 'search';
  term: string;
  settings: StoreSettings;
}

export interface SearchResultsMessage {
  action: 'searchResults';
  data: SearchResult[];
}

export interface Product {
  name: string;
  price: string;
  image: string;
  discount: boolean;
  sale: boolean;
  salesDesc: string;
}

export interface SearchResult {
  name: string;
  products: Product[];
  searchUrl?: string;
  error?: string;
  isLoading?: boolean;
}

export interface FieldConfig {
  selector?: string | null;
  condition?: (element: Element | null) => boolean;
}

export interface StoreScrapingConfig {
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

export interface ScrapingConfigs {
  [storeKey: string]: StoreScrapingConfig;
}

export type StoreKey = 'kroger' | 'meijer' | 'aldi' | 'walmart' | 'costco';

export interface MessageResponse {
  success: boolean;
  error?: string;
}