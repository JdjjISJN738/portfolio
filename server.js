const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const config = require('./config');

const PORT = process.env.PORT || 3000;

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
});

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  console.log('Request: ' + req.url);
  
  // Handle API requests
  if (req.method === 'POST' && req.url === '/api/contact') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const formData = JSON.parse(body);
        
        // Read existing messages
        const messagesPath = path.join(__dirname, 'messages.json');
        fs.readFile(messagesPath, 'utf8', (err, data) => {
          let messages = [];
          if (!err && data) {
            try {
              messages = JSON.parse(data);
            } catch (e) {
              console.error('Error parsing messages.json:', e);
            }
          }
          
          // Add new message with timestamp
          formData.timestamp = new Date().toISOString();
          messages.push(formData);
          
          // Save back to file
          fs.writeFile(messagesPath, JSON.stringify(messages, null, 2), (err) => {
            if (err) {
              console.error('Error writing to messages.json:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, message: 'Server error saving message' }));
            } else {
              console.log('Message saved successfully');
              
              // Send Email Notification
              if (!config.email.user || !config.email.pass || config.email.user === 'your-email@gmail.com') {
                  console.log('Skipping email: Credentials not configured in config.js');
                  res.writeHead(503, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ 
                      success: false, 
                      message: 'Email configuration missing. Please update config.js with your email credentials.' 
                  }));
                  return;
              }

              const mailOptions = {
                  from: config.email.user,
                  to: config.notificationTo,
                  subject: `New Portfolio Contact: ${formData.subject}`,
                  text: `
                      You have received a new message from your portfolio website.
                      
                      Name: ${formData.name}
                      Email: ${formData.email}
                      Subject: ${formData.subject}
                      
                      Message:
                      ${formData.message}
                  `
              };

              transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                      console.log('Error sending email:', error);
                      // Don't fail the response if email fails, just log it
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ success: true, message: 'Message received (Email failed)' }));
                  } else {
                      console.log('Email sent: ' + info.response);
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ success: true, message: 'Message received and email sent' }));
                  }
              });
            }
          });
        });
      } catch (e) {
        console.error('Invalid JSON received:', e);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
      }
    });
    return;
  }
  
  // Strip query string (e.g. ?v=2.0) before resolving file paths
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let filePath = '.' + parsedUrl.pathname;
  if (filePath === './' || filePath === '.') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code === 'ENOENT') {
        fs.readFile('./404.html', (error, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('404 Not Found', 'utf-8');
        });
      } else {
        res.writeHead(500);
        res.end('Server Error: '+error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server');
});
