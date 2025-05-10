// Node.js Events Interview Questions and Answers

// 1. What is the EventEmitter class in Node.js?
// It is a core module that facilitates event-driven programming by allowing objects to emit and listen for events.

// 2. How do you create and listen to events?
const EventEmitter = require('events');
const emitter = new EventEmitter();
emitter.on('sayHello', () => console.log('Hello!'));
emitter.emit('sayHello');

// 3. Common EventEmitter methods
// - on(): adds a listener
// - once(): adds a one-time listener
// - emit(): emits an event
// - removeListener(): removes a listener

// 4. Purpose of emitter.emit()
// Triggers the event so all associated listeners run

// 5. Remove an event listener
function greet() { console.log('Hi'); }
emitter.on('greet', greet);
emitter.removeListener('greet', greet);

// 6. Difference between on() and once()
// on() keeps the listener active; once() runs it a single time only
emitter.once('welcome', () => console.log('Welcome once'));
emitter.emit('welcome');
emitter.emit('welcome');

// 7. Pass arguments with events
emitter.on('data', (msg) => console.log(msg));
emitter.emit('data', 'Hello with args');

// 8. Multiple listeners
emitter.on('multi', () => console.log('First'));
emitter.on('multi', () => console.log('Second'));
emitter.emit('multi');

// 9. Handle errors using events
emitter.on('error', (err) => console.error('Caught error:', err));
emitter.emit('error', new Error('Something went wrong'));

// 10. Max listeners and increasing it
console.log(emitter.getMaxListeners());
emitter.setMaxListeners(20);

// 11. Check listener count
console.log(emitter.listenerCount('multi'));

// 12. Internal working of EventEmitter
// Stores listeners in an internal object and executes them when emit() is called

// 13. Memory leak issues
// Adding too many listeners without removing them can cause leaks. Use once() or removeListener().

// 14. Debug listener leaks
// Node emits a warning if listeners exceed limit. Use emitter.setMaxListeners() and inspect with process warnings.

// 15. Custom vs built-in events
// Custom events are user-defined; built-in events come from Node modules like streams, HTTP, etc.

// 16. Event-driven benefits
// Non-blocking, efficient for I/O operations and scalable for concurrent connections

// 17. Extending EventEmitter
class MyEmitter extends EventEmitter {
  doSomething() {
    this.emit('done', 'finished');
  }
}
const my = new MyEmitter();
my.on('done', msg => console.log(msg));
my.doSomething();
