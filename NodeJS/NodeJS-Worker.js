// Node.js Worker Threads Interview Questions and Answers

// 1. What are Worker Threads in Node.js?
// Worker Threads allow you to run JavaScript in parallel on multiple threads.

// 2. When should you use Worker Threads?
// Use them for CPU-intensive tasks that block the event loop, like encryption, image processing, etc.

// 3. How do you create a worker thread?
const { Worker } = require('worker_threads');
const worker = new Worker('./worker.js');

// 4. How do you communicate with a worker thread?
// Use worker.postMessage() and worker.on('message')
worker.postMessage('start');
worker.on('message', msg => console.log('From worker:', msg));

// 5. What is inside the worker.js file?
// worker.js
const { parentPort } = require('worker_threads');
parentPort.on('message', msg => {
  parentPort.postMessage(`Received: ${msg}`);
});

// 6. How do you pass data between threads?
// Via postMessage() – data is cloned or transferred if it's transferable (e.g., ArrayBuffer)

// 7. How do you handle errors in worker threads?
worker.on('error', err => console.error('Worker error:', err));

// 8. How do you terminate a worker thread?
worker.terminate().then(code => console.log(`Worker stopped with exit code ${code}`));

// 9. What are transferable objects?
// Objects like ArrayBuffer that can be moved (not cloned) between threads to avoid copying overhead

// 10. Difference between Worker Threads and child_process
// Worker Threads share memory; child_process uses IPC and has isolated memory

// 11. What is isMainThread in worker_threads?
const { isMainThread } = require('worker_threads');
console.log(isMainThread ? 'In main thread' : 'In worker thread');
