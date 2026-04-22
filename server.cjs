const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PROJECT_DIR = __dirname;
const VIDEO_DIR = path.join(__dirname, 'Resources', 'Avatar videos');

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.json': 'application/json'
};

const server = http.createServer((req, res) => {
    let filePath;
    let url = decodeURIComponent(req.url);
    
    console.log(`Request: ${url}`);
    
    if (url.startsWith('/videos/')) {
        filePath = path.join(VIDEO_DIR, url.replace('/videos/', ''));
    } else if (url === '/' || url === '/index.html') {
        filePath = path.join(PROJECT_DIR, 'index.html');
    } else {
        filePath = path.join(PROJECT_DIR, url);
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.stat(filePath, (err, stats) => {
        if (err) {
            console.error(`File not found: ${filePath}`);
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        
        if (ext === '.mp4' || ext === '.webm') {
            const range = req.headers.range;
            const fileSize = stats.size;
            
            if (range) {
                const parts = range.replace(/bytes=/, '').split('-');
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunkSize = end - start + 1;
                
                const fileStream = fs.createReadStream(filePath, { start, end });
                
                res.writeHead(206, {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunkSize,
                    'Content-Type': contentType
                });
                
                fileStream.pipe(res);
            } else {
                res.writeHead(200, {
                    'Content-Length': fileSize,
                    'Content-Type': contentType,
                    'Accept-Ranges': 'bytes'
                });
                
                fs.createReadStream(filePath).pipe(res);
            }
        } else {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Error loading file');
                    return;
                }
                
                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Content-Length': data.length
                });
                res.end(data);
            });
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🎬 AI Interview Experience Server`);
    console.log(`   Running at: http://localhost:${PORT}`);
    console.log(`   Video directory: ${VIDEO_DIR}`);
    console.log(`\n   Press Ctrl+C to stop\n`);
});
