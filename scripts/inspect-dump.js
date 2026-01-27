const fs = require('fs');
const content = fs.readFileSync('debug_1_10___COPPA_BERGAMO.html', 'utf8');
const index = content.indexOf('DSC07984');
if (index !== -1) {
    console.log('Found at index:', index);
    const start = Math.max(0, index - 500);
    const end = Math.min(content.length, index + 500);
    console.log('Context:\n' + content.substring(start, end));
} else {
    console.log('Not found');
}
