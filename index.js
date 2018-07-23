const http = require('http');

const PORT = process.env.PORT || 3000;

http
    .createServer((req, res) => res.end('test'))
    .listen(PORT);
