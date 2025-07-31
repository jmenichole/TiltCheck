#!/bin/bash

# TrapHouse Webapp - Code Paste Helper
# Use this script to quickly add code from Create.xyz

echo "🏠 TrapHouse WebApp - Code Migration Helper"
echo "==========================================="
echo ""

# Check if webapp is running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ WebApp is running at http://localhost:3000"
else
    echo "❌ WebApp is not running. Start it with:"
    echo "   cd webapp && npm run dev"
    echo ""
    exit 1
fi

echo ""
echo "📋 Migration Options:"
echo "1. Replace main page content (app/page.tsx)"
echo "2. Add new component file"
echo "3. Update global styles (app/globals.css)"
echo "4. View current project structure"
echo "5. Open webapp in browser"
echo ""

read -p "Choose option (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📝 Replace main page content..."
        echo "Current page.tsx will be backed up as page.tsx.backup"
        
        # Backup current file
        cp webapp/app/page.tsx webapp/app/page.tsx.backup
        
        echo ""
        echo "Paste your Create.xyz page code below."
        echo "Press Ctrl+D when done:"
        echo ""
        
        # Read multiline input
        cat > webapp/app/page.tsx
        
        echo ""
        echo "✅ Page updated! Check http://localhost:3000"
        ;;
        
    2)
        echo ""
        read -p "Enter component name (e.g., MyComponent): " component_name
        
        echo ""
        echo "📝 Creating new component: ${component_name}.tsx"
        echo "Paste your component code below."
        echo "Press Ctrl+D when done:"
        echo ""
        
        # Create component file
        cat > "webapp/components/${component_name}.tsx"
        
        echo ""
        echo "✅ Component created: webapp/components/${component_name}.tsx"
        echo "Import it in your page with:"
        echo "import ${component_name} from '@/components/${component_name}'"
        ;;
        
    3)
        echo ""
        echo "🎨 Update global styles..."
        echo "Current globals.css will be backed up"
        
        # Backup current file
        cp webapp/app/globals.css webapp/app/globals.css.backup
        
        echo ""
        echo "Paste your CSS code below."
        echo "Press Ctrl+D when done:"
        echo ""
        
        # Read CSS input
        cat > webapp/app/globals.css
        
        echo ""
        echo "✅ Styles updated!"
        ;;
        
    4)
        echo ""
        echo "📁 Current Project Structure:"
        echo ""
        tree webapp/ -I node_modules -L 3 2>/dev/null || ls -la webapp/
        ;;
        
    5)
        echo ""
        echo "🌐 Opening webapp in browser..."
        open http://localhost:3000 2>/dev/null || echo "Navigate to: http://localhost:3000"
        ;;
        
    *)
        echo "Invalid option. Please choose 1-5."
        ;;
esac

echo ""
echo "🚀 Happy coding!"
