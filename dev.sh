#!/bin/bash

# Development helper script for the Grocery Scraper TypeScript extension

echo "🛒 Grocery Scraper Development Helper"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "tsconfig.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to display help
show_help() {
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup     - Install dependencies and build the extension"
    echo "  build     - Build the TypeScript project"
    echo "  watch     - Watch for changes and rebuild automatically"
    echo "  clean     - Clean the dist directory"
    echo "  package   - Full build with assets for extension loading"
    echo "  help      - Show this help message"
    echo ""
    echo "For first-time setup, run: ./dev.sh setup"
}

# Function to install and setup
setup() {
    echo "📦 Installing dependencies..."
    npm install
    
    echo "🔨 Building project..."
    npm run prepare-extension
    
    echo "✅ Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Open chrome://extensions/"
    echo "2. Enable Developer mode"
    echo "3. Click 'Load unpacked' and select the 'dist' folder"
    echo ""
    echo "For development, run: ./dev.sh watch"
}

# Function to build
build() {
    echo "🔨 Building TypeScript..."
    npm run build
    echo "✅ Build complete!"
}

# Function to watch
watch() {
    echo "👀 Watching for changes..."
    echo "Press Ctrl+C to stop"
    npm run watch
}

# Function to clean
clean() {
    echo "🧹 Cleaning dist directory..."
    npm run clean
    echo "✅ Clean complete!"
}

# Function to package
package() {
    echo "📦 Packaging extension..."
    npm run prepare-extension
    echo "✅ Extension ready in dist/ folder!"
}

# Handle command line arguments
case "${1:-help}" in
    setup)
        setup
        ;;
    build)
        build
        ;;
    watch)
        watch
        ;;
    clean)
        clean
        ;;
    package)
        package
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac