// Node.js Streams Interview Questions and Answers

// 1. What are Streams in Node.js?
// Streams are objects that let you read or write data continuously instead of all at once.

// 2. What are the types of Streams in Node.js?
// - Readable
// - Writable
// - Duplex (both readable and writable)
// - Transform (duplex stream that can modify data)

// 3. How do you read a file using a stream?
const readable = fs.createReadStream('example.txt', 'utf8');
readable.on('data', chunk => console.log('Chunk:', chunk));
readable.on('end', () => console.log('Read complete'));

// 4. How do you write to a file using a stream?
const writable = fs.createWriteStream('stream-output.txt');
writable.write('Streamed line 1\n');
writable.end('Final line');

// 5. What are the benefits of using streams?
// - Efficient memory usage
// - Ideal for large data or files
// - Allows data to be processed as it’s received

// 6. What is piping in Node.js streams?
// Piping connects the output of one stream to the input of another
const r = fs.createReadStream('example.txt');
const w = fs.createWriteStream('copy.txt');
r.pipe(w);

// 7. How do you handle stream errors?
r.on('error', err => console.error('Read error:', err));
w.on('error', err => console.error('Write error:', err));

// 8. What is backpressure in streams?
// It occurs when the writable stream can’t handle the rate of incoming data from the readable stream

// 9. How do you create a custom readable stream?
const { Readable } = require('stream');
const customReadable = new Readable({
  read(size) {
    this.push('Custom chunk');
    this.push(null); // end stream
  }
});
customReadable.pipe(process.stdout);

// 10. How do you transform data in a stream?
const { Transform } = require('stream');
const toUpper = new Transform({
  transform(chunk, enc, cb) {
    cb(null, chunk.toString().toUpperCase());
  }
});
fs.createReadStream('example.txt').pipe(toUpper).pipe(process.stdout);
