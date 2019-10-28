const fs = require('fs');
const { https } = require('follow-redirects');
const proxy = require('express-http-proxy');
const express = require('express');

const key = fs.readFileSync('./key.pem');
const cert = fs.readFileSync('./cert.pem');

const app = express();
const server = https.createServer({key: key, cert: cert}, app);

if(process.argv.length !== 3){
    process.exit()
}

const EMPOWERHOST = process.argv[2];

app.use('/', proxy(EMPOWERHOST, {
    proxyReqOptDecorator: function(proxyReqOpts){
      proxyReqOpts.rejectUnauthorized = false;
      return proxyReqOpts
    },
    userResHeaderDecorator: function(headers, userReq, userRes){
        delete headers['x-frame-options'];
        if(userRes.removeHeader) { userRes.removeHeader('x-frame-options'); }
        return headers;
    },
    proxyErrorHandler: function(err, res, next) {
        console.error(err);
        next(err);},
    preserveHostHdr: true
}));

server.listen(8000, () => console.log('listening'));