
import { Client } from 'whatsapp-web.js';
console.log('whatsapp-web.js loaded successfully');
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    }
});
client.initialize().then(() => {
    console.log('Client initialized');
    process.exit(0);
}).catch(err => {
    console.error('Initialization failed:', err);
    process.exit(1);
});
// Set a timeout to prevent hanging in case of failure without error
setTimeout(() => {
    console.log('Timeout reached');
    process.exit(1);
}, 10000);
