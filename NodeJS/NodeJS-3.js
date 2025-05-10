// Node.js Interview Questions and Answers with Sample Code

// 1. What is Node.js?
// Node.js is a runtime environment that allows you to run JavaScript on the server side, built on Chrome's V8 engine.

// 2. Key Features
// - Event-driven, non-blocking I/O
// - Single-threaded model
// - Fast execution with V8
// - Large ecosystem via npm

// 3. require() vs import
const fs = require('fs'); // CommonJS
// import fs from 'fs'; // ES Module (need to set type="module" in package.json)

// 4. npm vs npx
// npm installs packages
// npx executes a package without installing globally

// 5. package.json
// Describes project dependencies, scripts, version info

// 6. Event Loop
setTimeout(() => console.log('Timeout'), 0);
promise = Promise.resolve();
promise.then(() => console.log('Promise'));
console.log('Main Thread');

// 7. Callbacks
fs.readFile('file.txt', (err, data) => {
  if (err) return console.error(err);
  console.log(data.toString());
});

// 8. Sync vs Async
const data = fs.readFileSync('file.txt'); // Sync
fs.readFile('file.txt', (err, data) => {}); // Async

// 9. Streams
const readable = fs.createReadStream('file.txt');
readable.on('data', chunk => console.log(chunk));

// 10. Global Objects
console.log(__dirname); // directory name
console.log(__filename); // file name

// 11. Concurrency in Node.js
// Event loop + async I/O makes it concurrent despite single-threaded model

// 12. nextTick vs setImmediate vs setTimeout
process.nextTick(() => console.log('nextTick'));
setImmediate(() => console.log('setImmediate'));
setTimeout(() => console.log('setTimeout'), 0);

// 13. Promises
fs.promises.readFile('file.txt', 'utf8').then(console.log).catch(console.error);

// 14. async/await
async function readFile() {
  try {
    const data = await fs.promises.readFile('file.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
readFile();

// 15. Middleware in Express.js
const express = require('express');
const app = express();
app.use((req, res, next) => {
  console.log('Middleware');
  next();
});

// 16. Handle Uncaught Exceptions
process.on('uncaughtException', err => {
  console.error('Uncaught:', err);
});

// 17. Event-driven programming
const EventEmitter = require('events');
const emitter = new EventEmitter();
emitter.on('event', () => console.log('Event fired!'));
emitter.emit('event');

// 18. cluster
const cluster = require('cluster');
const os = require('os');
if (cluster.isMaster) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
} else {
  console.log('Worker', process.pid);
}

// 19. File uploads (Multer)
// const multer = require('multer'); const upload = multer({ dest: 'uploads/' }); app.post('/upload', upload.single('file'), (req, res) => res.send('Uploaded'));

// 20. Prevent Callback Hell
fs.readFile('a.txt', (err, a) => {
  if (err) return;
  fs.readFile('b.txt', (err, b) => {
    if (err) return;
    fs.readFile('c.txt', (err, c) => {
      if (err) return;
    });
  });
});
// Use Promises or async/await instead

// 21. Node vs PHP/Java
// Node is event-driven and non-blocking; PHP/Java use multi-threading

// 22. libuv
// Library that provides Node’s event loop, handles async I/O

// 23. Caching
const cache = new Map();
function getCachedData(key) {
  if (cache.has(key)) return cache.get(key);
  const data = fetchFromDB(key);
  cache.set(key, data);
  return data;
}

// 24. Thread safety
// Use atomic operations or Worker Threads for shared data

// 25. Worker threads
const { Worker } = require('worker_threads');
new Worker('./worker.js');

// 26. Debugging
// Use --inspect flag or tools like VSCode debugger

// 27. Performance Optimization
// - Use clustering, load balancing, caching, DB indexing

// 28. Backpressure
readable.pipe(writable); // Will auto-handle backpressure

// 29. Garbage Collection
// V8 uses generational GC (mark-sweep, mark-compact)

// 30. spawn vs exec vs fork
const { spawn, exec, fork } = require('child_process');
spawn('ls', ['-lh']);
exec('ls -lh', (err, stdout) => console.log(stdout));
fork('child.js');

// 31. Security issues
// - SQL Injection, XSS, CSRF — use validation, helmet.js, escape input

// 32. Prevent SQL/NoSQL Injection
// Use parameterized queries (e.g., MongoDB’s `$eq`, PostgreSQL’s placeholders)

// 33. Testing tools
// Mocha, Jest, Chai, Supertest

// 34. Mock dependencies
// Use sinon.js or jest.mock()

// 35. Environment variables
require('dotenv').config();
console.log(process.env.MY_SECRET);
