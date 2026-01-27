const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets');
const SQUADRA_DIR = path.join(ASSETS_DIR, 'squadra');
const ALBUMS_DIR = path.join(ASSETS_DIR, 'albums');

// Files to keep (root assets only)
// Based on code analysis + logo
const KEEP_FILES = new Set([
    'DSC08495.jpg', 'DSC08495.webp',
    'DSC08524.jpg', 'DSC08524.webp',
    'DSC08437.jpg', 'DSC08437.webp',
    'DSC08451.jpg', 'DSC08451.webp',
    'DSC08466.jpg', 'DSC08466.webp',
    'logo.png', 'logo.webp'
]);

async function optimizeImage(filepath) {
    const filename = path.basename(filepath);
    const ext = path.extname(filename).toLowerCase();
    const basename = path.basename(filename, ext);
    
    // Target is always webp
    const newFilepath = path.join(path.dirname(filepath), `${basename}.webp`);

    console.log(`Optimizing ${filename}...`);
    try {
        // Load image
        let pipeline = sharp(filepath);

        // Get metadata to check dimensions
        const metadata = await pipeline.metadata();
        
        // Resize if width > 1920
        if (metadata.width > 1920) {
            console.log(`  -> Resizing from ${metadata.width}px to 1920px width`);
            pipeline = pipeline.resize({ width: 1920 });
        }

        // Save as WebP with lower quality for size reduction
        // Using a temporary buffer to handling overwriting the same file if input is webp
        const buffer = await pipeline
            .webp({ quality: 75 }) 
            .toBuffer();

        fs.writeFileSync(newFilepath, buffer);
        
        // If input was NOT webp, delete the original
        if (ext !== '.webp' && fs.existsSync(newFilepath)) {
            console.log(`  -> Deleted original ${filename}`);
            fs.unlinkSync(filepath);
        } else {
             console.log(`  -> Re-saved ${newFilepath}`);
        }
        
    } catch (err) {
        console.error(`Failed to optimize ${filename}:`, err);
    }
}

async function processRootAssets() {
    console.log('Processing root assets...');
    const files = fs.readdirSync(ASSETS_DIR);
    
    for (const file of files) {
        if (fs.statSync(path.join(ASSETS_DIR, file)).isDirectory()) continue;
        
        const ext = path.extname(file).toLowerCase();
        
        // Process ONLY the keep files (both jpg and existing webp)
        if (KEEP_FILES.has(file)) {
             await optimizeImage(path.join(ASSETS_DIR, file));
        } 
        // We already deleted unused stuff in previous step, but let's be safe and ignore others
    }
}

async function processDirectory(directory) {
    if (!fs.existsSync(directory)) return;
    console.log(`Processing directory: ${directory}`);
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
         if (fs.statSync(path.join(directory, file)).isDirectory()) continue;
         const ext = path.extname(file).toLowerCase();
         
         // Process all images in subfolders
         if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
             await optimizeImage(path.join(directory, file));
         }
    }
}

async function main() {
    await processRootAssets();
    await processDirectory(SQUADRA_DIR);
    await processDirectory(ALBUMS_DIR);
    console.log('Optimization complete.');
}

main().catch(console.error);
