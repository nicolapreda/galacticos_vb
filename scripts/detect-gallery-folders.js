#!/usr/bin/env node

/**
 * Auto-detect Folders from Drive
 * Scans the drive and automatically adds new folders to gallery-folders.json
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DRIVE_BASE_URL = 'https://drive.predanicola.it/s/i4rkc43fwrMEKB5';
const TOKEN = 'i4rkc43fwrMEKB5';
const JSON_PATH = path.join(__dirname, '../src/data/gallery-folders.json');

async function detectFolders() {
    console.log('🔍 Detecting folders from drive...');
    
    // Load existing folders
    let existingFolders = [];
    if (fs.existsSync(JSON_PATH)) {
        existingFolders = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    }
    const existingNames = new Set(existingFolders.map(f => f.name));
    
    console.log(`✅ Loaded ${existingNames.size} existing folders`);
    console.log(`   Existing: ${Array.from(existingNames).join(', ')}`);

    const browserOptions = {
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    };

    // Check for VPS Chromium
    const vpsChromiumPath = '/usr/bin/chromium-browser';
    if (fs.existsSync(vpsChromiumPath)) {
        browserOptions.executablePath = vpsChromiumPath;
    }

    const browser = await puppeteer.launch(browserOptions);
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        console.log(`\n📂 Navigating to drive...`);
        await page.goto(DRIVE_BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Wait for folder list
        try {
            await page.waitForSelector('.files-list__row-name-link, tr[data-cy-files-list-row-name]', { timeout: 15000 });
        } catch (e) {
            console.log('   Waiting for content...');
            await new Promise(r => setTimeout(r, 5000));
        }

        // Scroll to load all folders
        console.log('📜 Scrolling to load all folders...');
        let previousCount = 0;
        let noChangeCount = 0;
        
        for (let i = 0; i < 100; i++) {
            await page.evaluate(() => {
                const scrollable = document.querySelector('.files-list');
                if (scrollable) scrollable.scrollTop += 500;
                else window.scrollBy(0, 500);
            });
            
            await new Promise(r => setTimeout(r, 800));
            
            const currentCount = await page.evaluate(() => {
                return document.querySelectorAll('tr[data-cy-files-list-row-name], .files-list__row-name-link').length;
            });
            
            if (currentCount === previousCount) {
                noChangeCount++;
                if (noChangeCount > 10) break;
            } else {
                noChangeCount = 0;
                previousCount = currentCount;
            }
        }

        // Extract folder names
        console.log('\n📁 Extracting folder names...');
        const folderNames = await page.evaluate(() => {
            const folders = [];
            
            // Try data attribute first
            document.querySelectorAll('tr[data-cy-files-list-row-name]').forEach(row => {
                const name = row.getAttribute('data-cy-files-list-row-name');
                if (name && !name.endsWith('.jpg') && !name.endsWith('.png') && !name.endsWith('.jpeg')) {
                    folders.push(name);
                }
            });
            
            // Fallback to class
            if (folders.length === 0) {
                document.querySelectorAll('.files-list__row-name-link').forEach(el => {
                    const name = el.innerText.trim();
                    if (name && !name.match(/\.(jpg|png|jpeg|webp|gif)/i)) {
                        folders.push(name);
                    }
                });
            }
            
            return [...new Set(folders)]; // Remove duplicates
        });

        console.log(`✅ Found ${folderNames.length} folders on drive`);
        console.log(`   Folders: ${folderNames.join(', ')}`);

        // Find new folders
        const newFolders = folderNames.filter(name => !existingNames.has(name));
        
        if (newFolders.length === 0) {
            console.log('\n✅ No new folders detected.');
        } else {
            console.log(`\n🆕 Found ${newFolders.length} NEW folder(s):`);
            newFolders.forEach(name => console.log(`   + ${name}`));
            
            // Add new folders to JSON
            const newFolderObjects = newFolders.map(name => ({
                name: name,
                cover: null,
                images: []
            }));
            
            const updatedFolders = [...existingFolders, ...newFolderObjects];
            fs.writeFileSync(JSON_PATH, JSON.stringify(updatedFolders, null, 2));
            
            console.log(`\n✅ Updated gallery-folders.json with ${newFolders.length} new folder(s)`);
            console.log(`   Total folders now: ${updatedFolders.length}`);
            console.log('\n💡 Run "npm run sync-gallery" to sync images for these new folders.');
        }

        await page.close();

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await browser.close();
    }
}

detectFolders().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
