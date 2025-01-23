# NodeJS Interview Questions

## What are the differences between Node.js HTTP module and Express.js module ?

https://www.geeksforgeeks.org/what-are-the-differences-between-http-module-and-express-js-module/

## What the differences between Javascript and Typescript?

#### (1) Static Typing

Javascript is a dynamically typed language.

Typescript is a statically typed language.

    // Typescript   
    let num: number = 42;
    
#### (2) Type Interfaces 

Javascript lacks type inference.

Typescript infers types based on the assigned values.

    // Typescript
    let age = 30;   // Typescript infers age as number

#### (3) Compile-Time Errors

Javascript errors are runtime.

Typescript detects errors at compile time due to type checking.

    // Typescript error
    // Type 'string' is not assignable to type 'number'
    let total: number = "abc";

#### (4) Interfaces

Javascript lacks native support for defining interfaces.

Typescript allows you to define and use interfaces for complex data structures.

    // Typescript
    interface Person {
        name: string,
        age: number
    }

    let person: Person = { name: "Alice", age: 25 };

#### (5) Enums

Javascript supports no native enums.

Typescript supports enums for defining set of named constant values.

    // Typescript
    enum Color {
        Red,
        Green,
        Blue
    }

    let chosenColor: Color = Color.Green;

#### (6) Strict Mode

"use strict" mode is optional in Javascript for strict error handling.

Typescript strict mode is enforced by default.

    // Typescript will raise errors for unsafe code.
    let total = 10;

    total.toFixed(2);
    // Error: Property 'toFixed' does not exist on type 'number'.
