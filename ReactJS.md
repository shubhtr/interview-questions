# React Interview Questions

### Fake Data URLs

https://jsonplaceholder.typicode.com/users

https://jsonplaceholder.typicode.com/posts

/posts	100 posts
/comments	500 comments
/albums	100 albums
/photos	5000 photos
/todos	200 todos
/users	10 users

### What is the difference between a hook and a function component?

In React, hooks and function components are closely related but serve different purposes. Here’s how they differ:

1. Function Component
A function component is a JavaScript function that returns JSX (React elements).
It is used to define UI components.
Before React 16.8, function components were stateless—they could not manage state or lifecycle methods.
Example:
jsx
Copy
Edit
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}
2. Hook
A hook is a special function that adds React features (like state and side effects) to function components.
Hooks cannot be used outside function components or inside class components.
Examples:
useState() for managing state.
useEffect() for handling side effects.
useContext(), useReducer(), and custom hooks.
Example (useState hook inside a function component):
jsx
Copy
Edit
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
Key Differences
Feature	Function Component	Hook
Definition	A function returning JSX	A function to add state/lifecycle features
Purpose	Defines UI	Extends functionality in function components
Standalone?	Yes	No (must be inside a function component)
Examples	Button(), Card()	useState(), useEffect(), useRef()
In Simple Terms
A function component defines a piece of UI.
A hook is a function that enhances a function component by adding state or other React features.