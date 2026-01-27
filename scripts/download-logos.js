#!/usr/bin/env node

/**
 * Download Team Logos from CSI
 * 
 * This script downloads all team logos from the CSI website and saves them locally
 * to avoid 403 errors when displaying them on the website.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Directory to save logos
const LOGOS_DIR = path.join(__dirname, '..', 'public', 'team-logos');

// Ensure directory exists
if (!fs.existsSync(LOGOS_DIR)) {
    fs.mkdirSync(LOGOS_DIR, { recursive: true });
    console.log(`✅ Created directory: ${LOGOS_DIR}`);
}

/**
 * Download a file from a URL
 */
function downloadFile(url, filename) {
    return new Promise((resolve, reject) => {
        const filepath = path.join(LOGOS_DIR, filename);
        
        // Check if file already exists
        if (fs.existsSync(filepath)) {
            console.log(`⏭️  Skipping ${filename} (already exists)`);
            resolve(filepath);
            return;
        }

        console.log(`📥 Downloading ${filename}...`);
        
        const file = fs.createWriteStream(filepath);
        
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`✅ Downloaded ${filename}`);
                    resolve(filepath);
                });
            } else if (response.statusCode === 403) {
                console.log(`⚠️  403 Forbidden for ${filename} - creating placeholder`);
                file.close();
                fs.unlinkSync(filepath);
                resolve(null);
            } else {
                console.log(`❌ Failed to download ${filename}: HTTP ${response.statusCode}`);
                file.close();
                fs.unlinkSync(filepath);
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', (err) => {
            file.close();
            fs.unlinkSync(filepath);
            console.log(`❌ Error downloading ${filename}: ${err.message}`);
            reject(err);
        });
    });
}

/**
 * Extract logo URLs from scraper data
 */
async function downloadLogos() {
    console.log('🚀 Starting logo download...\n');

    // Import the scraper to get current standings
    const { getLeagueData } = require('../src/lib/scraper.ts');
    
    try {
        const { standings } = await getLeagueData();
        
        console.log(`Found ${standings.length} teams\n`);
        
        const downloads = [];
        
        for (const team of standings) {
            if (team.logo) {
                // Extract filename from URL
                const filename = team.logo.split('/').pop();
                downloads.push(downloadFile(team.logo, filename));
            }
        }
        
        await Promise.allSettled(downloads);
        
        console.log('\n✅ Logo download complete!');
        console.log(`📁 Logos saved to: ${LOGOS_DIR}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the script
downloadLogos();
