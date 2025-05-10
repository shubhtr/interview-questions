// Node.js Buffer Interview Questions and Answers

// 1. What is a Buffer in Node.js?
// Buffer is a global class in Node.js used to handle binary data directly in memory.

// 2. How do you create a Buffer?
const buf1 = Buffer.alloc(10); // 10-byte zero-filled buffer
const buf2 = Buffer.from('Hello'); // buffer from string

// 3. How do you write to a Buffer?
buf1.write('Hi');

// 4. How do you read from a Buffer?
console.log(buf2.toString()); // "Hello"

// 5. How do you convert a Buffer to JSON?
const json = buf2.toJSON();
console.log(json);

// 6. How can you concatenate buffers?
const buf3 = Buffer.from('Node');
const buf4 = Buffer.concat([buf2, buf3]);
console.log(buf4.toString()); // "HelloNode"

// 7. How do you compare two buffers?
const buf5 = Buffer.from('A');
const buf6 = Buffer.from('B');
console.log(buf5.compare(buf6)); // returns -1, 0, or 1

// 8. How do you copy a buffer?
const copy = Buffer.alloc(buf2.length);
buf2.copy(copy);
console.log(copy.toString());

// 9. What's the purpose of Buffer.byteLength?
console.log(Buffer.byteLength('Hello')); // Returns byte length of string

// 10. Why are Buffers useful?
// Buffers are used to efficiently manipulate binary data in I/O operations like file handling, network streams, etc.
