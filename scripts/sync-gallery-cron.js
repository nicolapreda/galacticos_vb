#!/usr/bin/env node

/**
 * Gallery Sync Cron Job
 * Esegue il sync del drive ogni ora
 */

const schedule = require('node-cron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Log file path
const LOG_FILE = path.join(__dirname, '../logs/gallery-sync.log');

// Create logs directory if it doesn't exist
const logsDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    // Also write to file
    try {
        fs.appendFileSync(LOG_FILE, logMessage + '\n');
    } catch (err) {
        console.error('Failed to write to log file:', err);
    }
}



async function runSync() {
    log('📸 Starting full gallery update cycle (Detect + Sync)...');
    
    // The 'sync-gallery' npm script now includes detection:
    // "node scripts/detect-gallery-folders.js && node scripts/sync-gallery.js"
    
    return new Promise((resolve) => {
        const proc = spawn('npm', ['run', 'sync-gallery'], {
            cwd: path.join(__dirname, '..'),
            stdio: 'pipe',
            shell: true
        });

        let output = '';

        proc.stdout.on('data', (data) => {
            const message = data.toString().trim();
            if (message) {
                log(`   ${message}`);
                output += message + '\n';
            }
        });

        proc.stderr.on('data', (data) => {
            const message = data.toString().trim();
            if (message) {
                log(`   ❌ ${message}`);
            }
        });

        proc.on('close', (code) => {
            if (code === 0) {
                log('✅ Gallery sync cycle completed successfully!');
            } else {
                log(`❌ Gallery sync cycle failed with exit code ${code}`);
            }
            resolve(code);
        });

        proc.on('error', (err) => {
            log(`❌ Failed to start process: ${err.message}`);
            resolve(1);
        });
    });
}

async function main() {
    log('🚀 Gallery Sync Cron started');
    log('⏰ Sync will run every hour (00 minutes past each hour)');
    log(`📝 Logs are saved to: ${LOG_FILE}\n`);

    // Run immediately on startup (optional)
    // await runSync();

    // Schedule cron job: every hour at minute 0
    // Pattern: minute (0-59), hour (0-23), day of month, month, day of week
    // "0 * * * *" = Every hour at minute 0
    schedule.schedule('0 * * * *', async () => {
        log('\n══════════════════════════════════════════════════════════════');
        log('⏳ Cron job triggered - running gallery sync...');
        log('══════════════════════════════════════════════════════════════');
        
        try {
            await runSync();
        } catch (err) {
            log(`❌ Error running sync: ${err.message}`);
        }
        
        log('══════════════════════════════════════════════════════════════\n');
    });

    // Keep the process alive
    log('✅ Cron scheduler is now running. Press Ctrl+C to stop.');
}

// Graceful shutdown
process.on('SIGTERM', () => {
    log('⏹️ SIGTERM received, gracefully shutting down...');
    process.exit(0);
});

process.on('SIGINT', () => {
    log('⏹️ SIGINT received, gracefully shutting down...');
    process.exit(0);
});

main().catch(err => {
    log(`❌ Fatal error: ${err.message}`);
    process.exit(1);
});
