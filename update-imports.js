const fs = require('fs');
const path = require('path');

// Define the path mappings
const pathMappings = [
  // Category card
  {
    old: '@/components/ui/cards/category-card-v3',
    new: '@/components/category/card/CategoryCard',
  },
  // Admin components
  {
    old: '@/components/admin/categories',
    new: '@/components/admin/category',
  },
  {
    old: '@/components/admin/products',
    new: '@/components/admin/product',
  },
  {
    old: '@/components/admin/users',
    new: '@/components/admin/user',
  },
  // Product components
  {
    old: '@/components/products',
    new: '@/components/product',
  },
  // Common components
  {
    old: '@/components/common/typography',
    new: '@/components/common/typography/typography',
  },
];

// Function to update imports in a file
function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    pathMappings.forEach(({ old, newPath }) => {
      const regex = new RegExp(`from ['"]${old.replace(/\//g, '[/\\]')}['"]`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `from '${newPath}'`);
        updated = true;
      }
    });

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated imports in ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Find all TypeScript/JavaScript files in the project
function processDirectory(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory() && !['node_modules', '.next', '.git'].includes(file.name)) {
      processDirectory(fullPath);
    } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
      updateImportsInFile(fullPath);
    }
  });
}

// Start processing from the project root
const projectRoot = path.join(__dirname);
console.log('🚀 Starting to update imports...');
processDirectory(projectRoot);
console.log('✨ Finished updating imports!');
