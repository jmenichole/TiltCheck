/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * 
 * This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
 * For licensing information, see LICENSE file in the root directory.
 */

const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
    if (req.url === "/health") {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({status: "OK", message: "Server running"}));
        return;
    }
    
    const file = req.url === "/" ? "index.html" : req.url.slice(1);
    
    if (fs.existsSync(file)) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(fs.readFileSync(file));
    } else {
        res.writeHead(404, {"Content-Type": "application/json"});
        res.end(JSON.stringify({error: "File not found", url: req.url}));
    }
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
