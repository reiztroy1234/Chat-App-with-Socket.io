# Chat-App-with-Socket.io

This is a simple chat app, created with Socket.io, a Nodejs library for realtime web applications, best for chatting app. It enables realtime, bi-directional communication between web clients and servers. It has two parts: a client-side library that runs in the browser, and a server-side library for Node.js. Both components have a nearly identical API.

[More about Socket.io](https://socket.io)

Login with any name, you want. If you want to send message to someone, told them to login with any name, know his/her username and send message with @username: [Write your message]. 
If you want to broadcast your message to everyone just write normal message and Send.

This chat app is hosted on [Heroku](https://www.heroku.com/) which is cloud platform as a service supporting several programming languages like Nodejs, PHP, Java, JavaScript and all.
To create project in Heroku, install Heroku CLI from [here](https://devcenter.heroku.com/articles/heroku-cli) and goto that folder where you have source code and run `heroku apps:create [name of app]` and before that you must have uploaded your code on Github. After that check with `git remote` that you must have 2 remotes, 1. origin and 2. heroku and after that `git push heroku master` to upload it on heroku.

You can check it here: https://chat-app-with-socketio.herokuapp.com/

### Nodejs must be installed

To install Sequelize, MySQL, Passport and Express you need to run:

`npm init` for initialzing

`npm install express` for installing express

`npm install socket.io` for installing socket.io

`npm install heroku` for installing heroku
