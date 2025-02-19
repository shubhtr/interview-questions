# VueJS Interview Questions

# 01

### 001 What is VueJS?

VueJS is a progressive JavaScript framework for building user interfaces and single-page applications. It's designed to be incrementally adoptable, meaning you can use it for a small part of a page or for an entire single-page application.

### 002 What are the key features of VueJS?

1. Reactive Data Binding
2. Component-Based Architecture
3. Directives like v-if, v-for, v-bind
4. Single-File Components (SFCs)
5. Vue CLI for scaffolding projects

### 03 What is a Vue instance?

The Vue instance is the root of any Vue application. It contains data, methods, computed properties, watchers, and lifecycle hooks. The instance connects Vue with the DOM element using the el option binds the instance to the DOM element.

### 04 How does VueJS handle data binding?

VueJS uses two-way data binding with the v-model directive, which syncs data between the model (Javascript data) and the view (HTML).

### 05 What are components in VueJS?

Components are resuable Vue instances with a name. They help create encapsulated, reusable elements in an app. Components can accept inputs called props and emit custom events to communicate with other components.

### 06 How do you pass data between components?

<ins>Parent to Child</ins>: Using props, which allows you to pass data from a parent component to a child component. 

<ins>Child to Parent</ins>: Using custom events and $emit to communicate from child to parent.

### 07 What are Lifecycle Hooks in VueJS?

Lifecycle hooks are methods that you to add code at specific stages of a component's lifecycle, such as created, mounted, updated and destroyed. Each hook serves a purpose, like initializing data in created or performing cleanup in destroyed.

### 08 What are Directives in VueJS?

Directives are special tokens in the markup that tell the library to do something to a DOM element. Common directives include: 

* *v-bind*
* *v-if* 
* *v-for*
* *v-model*
* *v-show*

### 09 What is Vue CLI, and why is it used?

Vue CLI is a tool that provides a full system for rapid Vue.js development, enabling you to scaffold new projects with configurations for single-page applications, testing, linting, and more.

### 10 How do you handle events in VueJS?

Events are handled using @ shorthand, like @click="methodName", to listen to events and call methods. Vue also supports event modifiers such as .prevent, .stop, and .capture to control event behavior.

### 11 What is Vue Router?

Vue Router is the official router for VueJS used to navigate between different pages or components in a single-page application (SPA). It allows for defining routes and handling navigation.

### 12 What is VueX, and when should it be used?

Vuex is a state management library for VueJS, typically used in larger applications to manage global state. It provides a centralized store where data can be shared across components without using props or events. 

### 13 What are the main differences between Vue 2 and Vue 3?

* Vue 3 introduces the Composition API for better code organization.
* It has improved performance and a smaller bundle size.
* Vue 3  uses the Proxy API for reactivity instead of Object.defineProperty to manage reactivity.

# 02

### Vue and Typescript

Vue is written in TypeScript itself and provides first-class TypeScript support. All official Vue packages come with bundled type declarations that should work out-of-the-box.


# References

https://www.youtube.com/watch?v=-iBAG3UloRA

https://vuejs.org/guide/typescript/overview.html


