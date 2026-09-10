const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const PUBLIC_DIR = path.join(__dirname, 'public');

let visitorCount = 0;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.json': 'application/json',
    '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const reqPath = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;
    const theme = parsedUrl.searchParams.get('theme') === 'dark' ? 'dark-mode' : 'light-mode';

    let filePath = path.join(PUBLIC_DIR, reqPath);
    let ext = path.extname(filePath).toLowerCase();
    let contentType = MIME_TYPES[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        let finalContent = content;
        console.log(reqPath);
        if (reqPath === '/index.html') {
            visitorCount++;
            console.log(`[VISIT #${visitorCount}] Connection from: ${req.socket.remoteAddress}`);
        }
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404: Page Not Found</h1>');
            return;
        }
        if (ext === '.html') {
            finalContent = Buffer.from(content.toString()
                .replace('{{COUNT}}', String(visitorCount))
                .replace('{{THEME_CLASS}}', theme)
            );
        }
        console.log(`[REQUEST] ${req.socket.remoteAddress} accessed ${reqPath}`);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(finalContent);
    });
}).listen(PORT, '0.0.0.0', () => {
    console.log(`Server live! Listening on port ${PORT}...`);
}); 