# Grocery Scraper

A Chrome extension for comparing grocery prices across multiple stores.

Saw my wife with 5 chrome tabs open trying to plot her route between multiple grocery stores to get the lowest prices on all our groceries and figured there had to be a better way. I would have preferred to use something like Playwright to scrape through the websites and return the data... but playwright's user agent was constantly getting blocked. Controlling a _real_ browser avoids that limitation entirely and might even be more convenient anyways.

## 🏗️ Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. Clone or download the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run prepare-extension
   ```

4. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Turn on developer mode (toggle switch in the upper right)
   - Click on `Load Unpacked`
   - Select the `dist` folder

## 🚀 Development Commands

- `npm run build` - Compile TypeScript files
- `npm run watch` - Watch for changes and recompile automatically
- `npm run clean` - Remove the dist folder
- `npm run prepare-extension` - Full build and asset copy for extension loading
- `npm run dev` - Clean, build, and watch for changes

## 📁 Project Structure

```
src/
├── types/           # TypeScript type definitions
├── scraping/        # Content scripts for web scraping
├── background.ts    # Service worker (background script)
├── popup.ts         # Extension popup interface
└── results.ts       # Results page functionality

dist/               # Compiled JavaScript output (for extension)
```

## 🛒 Supported Stores

- **Kroger** - kroger.com
- **Meijer** - meijer.com  
- **Aldi** - aldi.us
- **Walmart** - walmart.com
- **Costco** - costco.com

Each store has its own scraping configuration with type-safe definitions.

## 🎯 How to Use

1. Click on the extension icon
2. Enter a search term (e.g., "organic bananas")
3. Configure which stores to search (optional)
4. Click Search or press Enter
5. The extension will open tabs for each enabled store, scrape results, and display them in a comparison view

## 🔍 Technical Details

- **Manifest V3** Chrome extension
- **TypeScript 5.6+** with strict type checking
- **ES2020** target for modern browser features
- **Modular architecture** with clear separation of concerns
- **Type-safe message passing** between extension components

## 🧪 Development Notes

- The extension compiles TypeScript to JavaScript that runs in the browser
- Content scripts are injected into store websites to scrape product data
- Background script coordinates searches and manages tab lifecycle
- All Chrome extension APIs are properly typed with official type definitions
