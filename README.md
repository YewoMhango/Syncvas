# Syncvas (Synchronous Drawing Canvas)
A basic drawing app demo for users to draw on the same canvas on different devices and have everything synchronised between them.

WebSockets are used for communication and Node.js + express is used for the backend, while React is used for the frontend

It's not meant to be a full-featured drawing app, but just for basic illustrative purposes so far.

# Usage Steps
1. Run the `npm install` command in both the `client` and `server` directories
2. Build the frontend code by `cd`'ing into the `client` directory and running:

```
npm run build
```

3. Then, change back into the `server` directory and run:

```
npm start
```