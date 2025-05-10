// Node.js File System Interview Questions and Answers

// 1. What is the 'fs' module in Node.js?
// It provides APIs to interact with the file system in both synchronous and asynchronous ways.

const fs = require('fs');

// 2. How do you read a file asynchronously?
fs.readFile('example.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// 3. How do you read a file synchronously?
const dataSync = fs.readFileSync('example.txt', 'utf8');
console.log(dataSync);

// 4. How do you write to a file?
fs.writeFile('output.txt', 'Hello, Node.js!', err => {
  if (err) throw err;
  console.log('File written successfully');
});

// 5. How do you append to a file?
fs.appendFile('output.txt', '\nAppended text', err => {
  if (err) throw err;
  console.log('Text appended');
});

// 6. How do you delete a file?
fs.unlink('output.txt', err => {
  if (err) throw err;
  console.log('File deleted');
});

// 7. How do you check if a file exists?
fs.access('example.txt', fs.constants.F_OK, err => {
  console.log(err ? 'File does not exist' : 'File exists');
});

// 8. What is the difference between fs.readFile and fs.createReadStream?
// readFile reads the entire file into memory, while createReadStream streams it in chunks (better for large files).

const readStream = fs.createReadStream('example.txt');
readStream.on('data', chunk => console.log('Chunk:', chunk.toString()));

// 9. How do you rename a file?
fs.rename('example.txt', 'renamed.txt', err => {
  if (err) throw err;
  console.log('File renamed');
});

// 10. What are file permissions and how do you change them?
// File permissions determine access rights. Use fs.chmod():
fs.chmod('renamed.txt', 0o644, err => {
  if (err) throw err;
  console.log('Permissions changed');
});
