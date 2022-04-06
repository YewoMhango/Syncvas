# Syncvas (Synchronous Drawing Canvas)
A basic frontend drawing library for users to draw on the same canvas on different devices and have everything synchronised between them. The actual Syncvas "library" is located in the `client` folder. Everything else in repository as a whole is just meant to serve as an example of using it. 

In particular, WebSockets are used for communication and Node.js + express is used for the backend, though alternative solutions should work just fine.

It's not meant to be a full-featured drawing app, but just for basic illustrative purposes so far, such as in the case of an online learning and teaching app.