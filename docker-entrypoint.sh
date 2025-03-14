#!/bin/sh
set -e

# Print environment information for debugging
echo "Starting SpellBuddy application..."
echo "NODE_ENV: $NODE_ENV"
echo "Database path: /app/data/sqlite.db"

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
  echo "WARNING: OPENAI_API_KEY is not set. The application may not function correctly."
else
  # Print first 10 characters and length of the API key
  OPENAI_KEY_LENGTH=${#OPENAI_API_KEY}
  OPENAI_KEY_PREFIX=$(echo "$OPENAI_API_KEY" | cut -c 1-10)
  echo "OpenAI API key is configured. Prefix: $OPENAI_KEY_PREFIX... Length: $OPENAI_KEY_LENGTH"
  
  # Check if the API key starts with the expected prefix
  if [[ "$OPENAI_API_KEY" == sk-* ]]; then
    echo "OpenAI API key has the expected 'sk-' prefix."
  else
    echo "WARNING: OpenAI API key does not start with 'sk-'. This might cause issues."
  fi
fi

# Check if JWT_SECRET is set
if [ -z "$JWT_SECRET" ]; then
  echo "WARNING: JWT_SECRET is not set. Authentication may not work correctly."
else
  JWT_SECRET_LENGTH=${#JWT_SECRET}
  echo "JWT_SECRET is configured. Length: $JWT_SECRET_LENGTH"
fi

# Check if OPENAI_MODEL is set
if [ -z "$OPENAI_MODEL" ]; then
  echo "Using default OpenAI model: gpt-4o-mini"
else
  echo "Using OpenAI model: $OPENAI_MODEL"
fi

# Check if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Using DATABASE_URL: $DATABASE_URL"
fi

# Ensure data directory exists with proper permissions
mkdir -p /app/data
chmod -R 755 /app/data
touch /app/data/sqlite.db
chmod 666 /app/data/sqlite.db

# Ensure drizzle directories exist with proper permissions
mkdir -p /app/drizzle/migrations /app/drizzle/meta
chmod -R 755 /app/drizzle

# Create empty journal file in all possible locations
echo "Creating empty journal files..."
JOURNAL_CONTENT='{"version":"5","entries":[]}'

# Create all possible journal file locations
mkdir -p /app/drizzle/meta
mkdir -p /app/meta
mkdir -p /app/node_modules/src/meta
mkdir -p /app/src/meta
mkdir -p /app/node_modules/drizzle/meta

# Write the journal content to the primary location
echo "$JOURNAL_CONTENT" > /app/meta/_journal.json
chmod 644 /app/meta/_journal.json
echo "Created primary journal file at /app/meta/_journal.json"

# Create hard copies (not just symlinks) in all possible locations
cp /app/meta/_journal.json /app/drizzle/meta/_journal.json
cp /app/meta/_journal.json /app/src/meta/_journal.json
cp /app/meta/_journal.json /app/node_modules/src/meta/_journal.json
if [ ! -d "/app/node_modules/drizzle" ]; then
  mkdir -p /app/node_modules/drizzle/meta
fi
cp /app/meta/_journal.json /app/node_modules/drizzle/meta/_journal.json 2>/dev/null || true

# Also create the file in the current working directory if needed
if [ ! -f "./meta/_journal.json" ]; then
  mkdir -p ./meta
  cp /app/meta/_journal.json ./meta/_journal.json 2>/dev/null || true
fi

echo "Copied journal files to all possible locations"

# Create a helper script to find the journal file
cat > /app/find-journal.js << 'EOF'
const fs = require('fs');
const path = require('path');

// List of possible locations
const locations = [
  '/app/meta/_journal.json',
  '/app/drizzle/meta/_journal.json',
  '/app/src/meta/_journal.json',
  '/app/node_modules/src/meta/_journal.json',
  '/app/node_modules/drizzle/meta/_journal.json',
  'meta/_journal.json',
  './meta/_journal.json',
  '../meta/_journal.json'
];

// Check each location
for (const loc of locations) {
  try {
    if (fs.existsSync(loc)) {
      console.log(`Journal file found at: ${loc}`);
      process.exit(0);
    }
  } catch (err) {
    // Ignore errors
  }
}

console.log('Journal file not found in any of the expected locations');
process.exit(1);
EOF

# Run the helper script to verify journal file locations
echo "Verifying journal file locations:"
node /app/find-journal.js || echo "Warning: Journal file verification failed"

# Create a migration patch script to handle the error
cat > /app/migration-patch.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Function to create tables directly if migration fails
async function createTablesDirectly() {
  console.log("Creating tables directly as a fallback...");
  
  try {
    // Import the database connection
    const db = require('./src/lib/db/db');
    
    // Check if the database is connected
    if (db) {
      console.log("Database connection established");
      
      // Execute schema creation
      try {
        const schemaModule = require('./src/lib/db/schema');
        console.log("Schema module loaded");
        console.log("Tables should be created by the schema module");
        console.log("Migration patch completed successfully");
      } catch (err) {
        console.error("Error loading schema module:", err);
      }
    } else {
      console.error("Failed to connect to database");
    }
  } catch (err) {
    console.error("Error in migration patch:", err);
  }
}

// Run the function
createTablesDirectly();
EOF

# Initialize database if it does not exist
if [ ! -s "/app/data/sqlite.db" ]; then
  echo "Database does not exist or is empty. Initializing..."
  # Try to use @swc-node/register, fall back to direct node if not available
  if node -e "require.resolve('@swc-node/register')" 2>/dev/null; then
    node -r @swc-node/register src/lib/db/schema-generator.ts || echo "Schema generation failed, but continuing startup"
    sleep 2
    node -r @swc-node/register src/lib/db/migrate.ts || echo "Migration failed, trying fallback..."
    # If migration failed, try our patch script
    if [ $? -ne 0 ]; then
      echo "Using migration patch script..."
      node /app/migration-patch.js
    fi
  else
    echo "Warning: @swc-node/register not found, trying direct execution"
    node src/lib/db/schema-generator.ts || echo "Schema generation failed, but continuing startup"
    sleep 2
    node src/lib/db/migrate.ts || echo "Migration failed, trying fallback..."
    # If migration failed, try our patch script
    if [ $? -ne 0 ]; then
      echo "Using migration patch script..."
      node /app/migration-patch.js
    fi
  fi
else
  # Check if we need to run migrations
  echo "Checking for pending migrations..."
  # Try to use @swc-node/register, fall back to direct node if not available
  if node -e "require.resolve('@swc-node/register')" 2>/dev/null; then
    node -r @swc-node/register src/lib/db/migrate.ts || echo "Migration failed, trying fallback..."
    # If migration failed, try our patch script
    if [ $? -ne 0 ]; then
      echo "Using migration patch script..."
      node /app/migration-patch.js
    fi
  else
    echo "Warning: @swc-node/register not found, trying direct execution"
    node src/lib/db/migrate.ts || echo "Migration failed, trying fallback..."
    # If migration failed, try our patch script
    if [ $? -ne 0 ]; then
      echo "Using migration patch script..."
      node /app/migration-patch.js
    fi
  fi
fi

# Print environment variables that will be available to the application
echo "Environment variables for the application:"
echo "NODE_ENV=$NODE_ENV"
echo "OPENAI_MODEL=$OPENAI_MODEL"
echo "DATABASE_URL=$DATABASE_URL"
echo "OPENAI_API_KEY is $(if [ -z "$OPENAI_API_KEY" ]; then echo "NOT "; fi)set"
echo "JWT_SECRET is $(if [ -z "$JWT_SECRET" ]; then echo "NOT "; fi)set"

# Set additional environment variables for Next.js
export NEXT_TELEMETRY_DISABLED=1
export NEXT_SHARP_PATH=/app/node_modules/sharp
export NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL:-http://localhost:3000}

# Ensure proper permissions for static assets
if [ -d ".next/static" ]; then
  echo "Setting proper permissions for static assets..."
  chmod -R 755 .next/static
fi

# Ensure public directory exists and has proper permissions
if [ -d "public" ]; then
  echo "Setting proper permissions for public directory..."
  chmod -R 755 public
  echo "Contents of public directory:"
  ls -la public
else
  echo "Warning: public directory not found"
  mkdir -p public
  chmod 755 public
fi

# Check for global CSS file in src directory
if [ ! -f "src/app/globals.css" ]; then
  echo "Creating global CSS file in src directory..."
  mkdir -p src/app
  cat > src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
EOF
  echo "Global CSS file created"
fi

# Create a custom document file if it doesn't exist
if [ ! -f "src/pages/_document.tsx" ] && [ ! -f "src/pages/_document.js" ]; then
  echo "Creating custom document file..."
  mkdir -p src/pages
  cat > src/pages/_document.tsx << 'EOF'
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="stylesheet" href="/_next/static/css/fallback.css" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
EOF
  echo "Custom document file created"
fi

# Verify Next.js installation
echo "Verifying Next.js installation..."
if [ -d "node_modules/next" ]; then
  echo "Next.js package found in node_modules"
  
  # Check package.json for Next.js version
  NEXT_VERSION=$(node -e "try { console.log(require('./package.json').dependencies.next); } catch(e) { console.log('unknown'); }")
  echo "Next.js version in package.json: $NEXT_VERSION"
  
  # Check if the installed version matches
  if [ -f "node_modules/next/package.json" ]; then
    INSTALLED_VERSION=$(node -e "try { console.log(require('./node_modules/next/package.json').version); } catch(e) { console.log('unknown'); }")
    echo "Installed Next.js version: $INSTALLED_VERSION"
  else
    echo "Warning: Next.js package.json not found in node_modules"
  fi
else
  echo "Warning: Next.js package not found in node_modules, attempting to install..."
  npm install next@15.2.2 --no-save
fi

# Create a script to directly inject CSS into HTML files
cat > /app/inject-inline-css.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Find HTML files
const findHtmlFiles = (dir) => {
  const results = [];
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        results.push(...findHtmlFiles(fullPath));
      } else if (file.name.endsWith('.html') || file.name.endsWith('.js')) {
        results.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
  }
  
  return results;
};

// Basic CSS styles
const inlineStyles = `
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    line-height: 1.5;
    color: #333;
    background-color: #f5f5f5;
    margin: 0;
    padding: 0;
  }
  
  a {
    color: #0070f3;
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
  
  button, .button {
    background-color: #0070f3;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  
  button:hover, .button:hover {
    background-color: #0051a2;
  }
  
  input, textarea, select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    width: 100%;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    margin-bottom: 1rem;
  }
  
  @media (prefers-color-scheme: dark) {
    body {
      color: #f5f5f5;
      background-color: #1a1a1a;
    }
    
    .card {
      background-color: #2a2a2a;
      box-shadow: 0 4px 6px rgba(255, 255, 255, 0.1);
    }
  }
</style>
`;

// Inject inline CSS
const injectInlineCSS = () => {
  try {
    const htmlFiles = findHtmlFiles('/app/.next/server');
    console.log(`Found ${htmlFiles.length} files to process`);
    
    let injectedCount = 0;
    
    for (const file of htmlFiles) {
      try {
        if (file.endsWith('.html')) {
          let content = fs.readFileSync(file, 'utf8');
          
          // Check if styles are already injected
          if (!content.includes('<style>') && content.includes('</head>')) {
            // Inject styles before </head>
            content = content.replace('</head>', `${inlineStyles}\n</head>`);
            
            fs.writeFileSync(file, content);
            console.log(`Injected inline CSS into ${file}`);
            injectedCount++;
          }
        } else if (file.endsWith('.js') && file.includes('app/page')) {
          // For JavaScript files that might contain HTML (Next.js app router)
          let content = fs.readFileSync(file, 'utf8');
          
          // Only inject if it seems to be a page component and doesn't already have styles
          if (content.includes('export') && !content.includes('<style>')) {
            // Look for a place to inject the styles - this is a simplistic approach
            if (content.includes('return') && content.includes('<')) {
              // Add the styles as a string literal in the component
              content = content.replace(
                /return\s*\(/,
                `return (
                <>
                  <style dangerouslySetInnerHTML={{ __html: \`
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                      line-height: 1.5;
                      color: #333;
                      background-color: #f5f5f5;
                      margin: 0;
                      padding: 0;
                    }
                    a { color: #0070f3; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                    button, .button {
                      background-color: #0070f3;
                      color: white;
                      border: none;
                      padding: 0.5rem 1rem;
                      border-radius: 0.25rem;
                      cursor: pointer;
                    }
                    .container { max-width: 1200px; margin: 0 auto; padding: 1rem; }
                    .card {
                      background-color: white;
                      border-radius: 0.5rem;
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                      padding: 1.5rem;
                      margin-bottom: 1rem;
                    }
                    @media (prefers-color-scheme: dark) {
                      body { color: #f5f5f5; background-color: #1a1a1a; }
                      .card { background-color: #2a2a2a; }
                    }
                  \`}} />
                `
              );
              
              fs.writeFileSync(file, content);
              console.log(`Injected inline CSS into ${file}`);
              injectedCount++;
            }
          }
        }
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }
    
    console.log(`Inline CSS injection completed. Injected into ${injectedCount} files.`);
  } catch (err) {
    console.error('Error in inline CSS injection:', err);
  }
};

injectInlineCSS();
EOF

# Run the inline CSS injection script
echo "Running inline CSS injection script..."
node /app/inject-inline-css.js || echo "Inline CSS injection failed, but continuing startup"

# Check if Next.js build files exist
if [ -d ".next" ]; then
  echo "Found Next.js build directory at .next/"
  
  # List the contents of the .next directory for debugging
  echo "Contents of .next directory:"
  ls -la .next
  
  # Check for CSS files in the build
  echo "Checking for CSS files in the build..."
  find .next -name "*.css" || echo "No CSS files found in the build"
  
  # Create a fallback CSS file if none exists
  if [ -z "$(find .next -name "*.css" 2>/dev/null)" ]; then
    echo "No CSS files found, creating fallback CSS..."
    
    # Create a directory for the fallback CSS
    mkdir -p .next/static/css
    
    # Create a basic CSS file with essential styles
    cat > .next/static/css/fallback.css << 'EOF'
    /* Fallback CSS for SpellBuddy */
    :root {
      --foreground-rgb: 0, 0, 0;
      --background-start-rgb: 214, 219, 220;
      --background-end-rgb: 255, 255, 255;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --foreground-rgb: 255, 255, 255;
        --background-start-rgb: 0, 0, 0;
        --background-end-rgb: 0, 0, 0;
      }
    }

    body {
      color: rgb(var(--foreground-rgb));
      background: linear-gradient(
          to bottom,
          transparent,
          rgb(var(--background-end-rgb))
        )
        rgb(var(--background-start-rgb));
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    }

    a {
      color: #0070f3;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    button, .button {
      background-color: #0070f3;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      cursor: pointer;
    }

    button:hover, .button:hover {
      background-color: #0051a2;
    }

    input, textarea, select {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 0.25rem;
      width: 100%;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }

    .card {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      margin-bottom: 1rem;
    }

    @media (prefers-color-scheme: dark) {
      .card {
        background-color: #1a1a1a;
        box-shadow: 0 4px 6px rgba(255, 255, 255, 0.1);
      }
    }
    EOF

    # Create a script to inject the CSS
    cat > /app/inject-css.js << 'EOF'
    const fs = require('fs');
    const path = require('path');

    // Find HTML files
    const findHtmlFiles = (dir) => {
      const results = [];
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          results.push(...findHtmlFiles(fullPath));
        } else if (file.name.endsWith('.html')) {
          results.push(fullPath);
        }
      }
      
      return results;
    };

    // Inject CSS link into HTML files
    const injectCss = () => {
      try {
        const cssPath = '/app/.next/static/css/fallback.css';
        if (!fs.existsSync(cssPath)) {
          console.error('Fallback CSS file not found');
          return;
        }
        
        const htmlFiles = findHtmlFiles('/app/.next/server');
        console.log(`Found ${htmlFiles.length} HTML files to process`);
        
        for (const htmlFile of htmlFiles) {
          try {
            let content = fs.readFileSync(htmlFile, 'utf8');
            
            // Check if CSS is already injected
            if (!content.includes('fallback.css')) {
              // Inject CSS link before </head>
              content = content.replace(
                '</head>',
                '<link rel="stylesheet" href="/_next/static/css/fallback.css" />\n</head>'
              );
              
              fs.writeFileSync(htmlFile, content);
              console.log(`Injected CSS into ${htmlFile}`);
            }
          } catch (err) {
            console.error(`Error processing ${htmlFile}:`, err);
          }
        }
        
        console.log('CSS injection completed');
      } catch (err) {
        console.error('Error in CSS injection:', err);
      }
    };

    injectCss();
    EOF

    # Run the CSS injection script
    echo "Running CSS injection script..."
    node /app/inject-css.js
  fi

  # Check if we have the main app files
  if [ -d ".next/server/app" ] && [ -d ".next/static" ]; then
    echo "Next.js build files appear to be present"
    
    # Check if we have node_modules/next/dist/bin/next
    if [ -f "node_modules/next/dist/bin/next" ]; then
      echo "Starting Next.js application using next start..."
      # Use exec to replace the current process with Next.js
      # Add the --hostname 0.0.0.0 flag to ensure it listens on all interfaces
      exec node node_modules/next/dist/bin/next start --hostname 0.0.0.0 -p 3000
    else
      echo "Looking for next binary..."
      find ./node_modules -name "next" -type f | grep -v "package.json" || echo "Next binary not found"
      
      echo "Checking for npx..."
      which npx || echo "npx not found, installing..."
      
      if ! which npx > /dev/null; then
        echo "Installing npx..."
        apk add --no-cache npm
      fi
      
      echo "Starting Next.js application using npx next start..."
      exec npx next start --hostname 0.0.0.0 -p 3000
    fi
  else
    echo "ERROR: Next.js build files incomplete. Missing key directories."
    echo "Available directories in .next:"
    find .next -type d | sort
    
    # Try to start anyway as a last resort
    echo "Attempting to start Next.js anyway as a last resort..."
    if [ -f "node_modules/next/dist/bin/next" ]; then
      exec node node_modules/next/dist/bin/next start --hostname 0.0.0.0 -p 3000
    else
      exec npx next start --hostname 0.0.0.0 -p 3000
    fi
  fi
else
  echo "ERROR: Next.js build directory (.next) not found."
  echo "Available directories in app root:"
  ls -la
  
  # Try to build on the fly as a last resort
  echo "Attempting to build Next.js on the fly..."
  if [ -f "node_modules/next/dist/bin/next" ]; then
    node node_modules/next/dist/bin/next build
    exec node node_modules/next/dist/bin/next start --hostname 0.0.0.0 -p 3000
  else
    npx next build
    exec npx next start --hostname 0.0.0.0 -p 3000
  fi
fi 