const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const DRIVE_BASE_URL = 'https://drive.predanicola.it/s/i4rkc43fwrMEKB5';
const TOKEN = 'i4rkc43fwrMEKB5';
const JSON_PATH = path.join(__dirname, '../src/data/gallery-folders.json');
const MAX_RETRIES = 3;

// Helper: Parse the total file count from the footer/header
async function getTotalExpectedFiles(page) {
    return await page.evaluate(() => {
        // Look for text like "147 file" or "20 immagini"
        // The browser agent found it in a span, often with "file ·" text
        
        // 1. Try finding generic footer text
        const spans = Array.from(document.querySelectorAll('span, div, p'));
        for (const el of spans) {
            const text = el.innerText || "";
            // Regex for "X file" or "X immagini"
            // "147 file"
            const match = text.match(/(\d+)\s+(file|immagini|elementi|items)/i);
            if (match && text.length < 50) { // Keep it short to avoid matching giant paragraphs
                return parseInt(match[1]);
            }
        }
        
        return 0; // fallback
    });
}

async function smartScroll(page) {
    console.log('   📜 Starting Smart Scroll on .files-list...');
    
    // 1. Identify expected count
    let expectedCount = await getTotalExpectedFiles(page);
    if (expectedCount > 0) {
        console.log(`      🎯 Aiming for ~${expectedCount} files based on footer info.`);
    } else {
        console.log(`      ⚠️ Could not find total file count, using stability check.`);
        // Default expected if not found?
    }

    let noChangeCount = 0;
    
    // Inject a Set into the page to track unique files across scrolls
    await page.evaluate(() => {
        window.startScraping = () => {
             window.uniqueFiles = new Set();
        };
        window.collectFiles = () => {
             const rows = document.querySelectorAll('tr[data-cy-files-list-row-name]');
             let added = 0;
             rows.forEach(row => {
                 const name = row.getAttribute('data-cy-files-list-row-name');
                 if (name) {
                     window.uniqueFiles.add(name);
                     added++;
                 }
             });
             // Also try the agent's selector as backup
             document.querySelectorAll('.files-list__row-name-link').forEach(el => {
                 window.uniqueFiles.add(el.innerText.trim());
             });
             
             return window.uniqueFiles.size;
        };
        window.getUniqueFiles = () => Array.from(window.uniqueFiles);
        
        window.startScraping();
    });

    const maxScrolls = 200; 
    let previousUniqueCount = 0;
    
    for (let i = 0; i < maxScrolls; i++) {
        // Scroll incrementally to ensure virtualization triggers
        await page.evaluate(() => {
            const scrollable = document.querySelector('.files-list');
            if (scrollable) {
                // Scroll by a chunk
                scrollable.scrollTop += 500;
                // Also jump to bottom occasionally to trigger end
                if (Math.random() > 0.8) scrollable.scrollTop = scrollable.scrollHeight;
            } else {
                window.scrollBy(0, 500);
            }
        });
        
        // Wait for load
        await new Promise(r => setTimeout(r, 800)); // slightly faster
        
        // Collect
        const currentUniqueCount = await page.evaluate(() => window.collectFiles());
        // console.log(`      Collected ${currentUniqueCount} unique files so far...`);
        
        if (expectedCount > 0 && currentUniqueCount >= expectedCount) {
            console.log(`      ✅ Reached expected count (${currentUniqueCount}/${expectedCount}). Stopping scroll.`);
            break;
        }

        if (currentUniqueCount > previousUniqueCount) {
             previousUniqueCount = currentUniqueCount;
             noChangeCount = 0;
        } else {
            noChangeCount++;
        }
        
        if (noChangeCount > 15) { // Increased patience for network lags
            console.log(`      🛑 Collection stabilized at ${currentUniqueCount} unique items.`);
            break;
        }
    }
    
    // Finally, ensure our images list in the main function uses this set!
    // We will extract the files from this Set.
}

function constructPreviewUrl(folderName, filename) {
    const filePathEncoded = encodeURIComponent(`/${folderName}/${filename}`);
    return `https://drive.predanicola.it/apps/files_sharing/publicpreview/${TOKEN}?file=${filePathEncoded}&x=1920&y=1080&a=true`;
}

async function processFolder(page, folder, retryCount = 0) {
    console.log(`🔍 Processing: ${folder.name} (Attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    
    try {
        const targetUrlObj = new URL(DRIVE_BASE_URL);
        targetUrlObj.searchParams.set('dir', '/' + folder.name);
        const targetUrl = targetUrlObj.toString();
        
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
        
        // Wait specifically for the file list table or rows
        try {
            await page.waitForSelector('.files-list__row-name-link, tr[data-cy-files-list-row-name]', { timeout: 15000 });
        } catch(e) {
            console.log('   ⏳ Waiting a bit longer for content...');
            await new Promise(r => setTimeout(r, 5000));
        }

        // Scroll to trigger lazy loading with smart detection
        await smartScroll(page);
        await new Promise(r => setTimeout(r, 1000)); // Final Settle

        // Scrape Files using the Set we collected
        const files = await page.evaluate(() => {
            const allFiles = window.getUniqueFiles ? window.getUniqueFiles() : [];
            if (allFiles && allFiles.length > 0) return allFiles;
            
            // Fallback
            const domFiles = [];
            const rows = document.querySelectorAll('tr[data-cy-files-list-row-name]');
            rows.forEach(r => domFiles.push(r.getAttribute('data-cy-files-list-row-name')));
            return domFiles;
        }).then(fetchedFiles => {
            // Filter images
            return fetchedFiles.filter(name => name && name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/));
        });

        if (files.length > 0) {
            console.log(`   📸 Found ${files.length} images.`);
            
            // Update Folder Object
            folder.images = files.map(f => constructPreviewUrl(folder.name, f));
            
            // Set cover if missing or update it to the first found
            if (!folder.cover && folder.images.length > 0) {
                folder.cover = folder.images[0];
            }
            return true; // Success
        } else {
            throw new Error("No images found");
        }

    } catch (err) {
        console.warn(`   ⚠️ Error: ${err.message}`);
        if (retryCount < MAX_RETRIES - 1) {
            console.log(`   🔄 Retrying...`);
            return processFolder(page, folder, retryCount + 1);
        }
        return false;
    }
}

async function main() {
    console.log('🚀 Starting Robust Gallery Sync...');
    
    let folders = [];
    if (fs.existsSync(JSON_PATH)) {
        folders = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    }

    const browserOptions = {
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    };

    // Check for VPS-specific Chromium path
    const vpsChromiumPath = '/usr/bin/chromium-browser';
    if (fs.existsSync(vpsChromiumPath)) {
        console.log(`   🐧 VPS detected! Using Chromium at: ${vpsChromiumPath}`);
        browserOptions.executablePath = vpsChromiumPath;
    } else {
         console.log(`   💻 Local environment detected. Using bundled Chromium.`);
    }

    const browser = await puppeteer.launch(browserOptions);
    
    // Use a persistent page or new page per folder? New page is safer for cleanup.
    // But let's reuse one browser instance.

    try {
        for (const folder of folders) {
            // Validate: If we already have a long list of images, maybe skip?
            // User said "scrap ALL images", implies re-checking.
            // But to save time, if we have > 5 images, assume it's good?
            // actually, let's just do all of them to be safe as per user request.

            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

            const success = await processFolder(page, folder);
            if (!success) {
                console.error(`   ❌ Failed to sync folder: ${folder.name}`);
            }

            await page.close();

            // Save incrementally
            fs.writeFileSync(JSON_PATH, JSON.stringify(folders, null, 2));
        }
        
        console.log('✅ Sync Completed!');

    } catch (err) {
        console.error('Fatal Error:', err);
    } finally {
        await browser.close();
    }
}

main();
