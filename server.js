//////EXPRESS////////
const express = require('express');
const app = express();

////////HTTP/////////
const http = require('http').createServer(app);

var path = require('path');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const todoRoutes = express.Router();

app.use(cors());
app.use(bodyParser.json());  

//Port and server setup
const PORT = process.env.PORT || 3001; 

//Server
const server = app.listen(PORT, function () {
    console.log("Server is running on Port: " + PORT);
});

/////SOCKET.IO///////
const io = require('socket.io').listen(server);

////////EJS//////////
const ejs = require('ejs');

//Setup the views folder
app.set("views", __dirname + '/views');

//Setup ejs, so I can write HTML(:
app.engine('.html', ejs.__express);
app.set('view-engine', 'html');

//Setup the public client folder
app.use(express.static(__dirname + '/public'));

let clients = {}


//Socket setup
io.on('connection', client=>{

    console.log('User ' + client.id + ' connected, there are ' + io.engine.clientsCount + ' clients connected');
  
    //Add a new client indexed by his id
    clients[client.id] = {
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    }
  
    //Make sure to send the client it's ID
    client.emit('introduction', client.id, io.engine.clientsCount, Object.keys(clients));
  
    //Update everyone that the number of users has changed
    io.sockets.emit('newUserConnected', io.engine.clientsCount, client.id, Object.keys(clients));
  
    client.on('move', (pos)=>{
  
      clients[client.id].position = pos;
      io.sockets.emit('userPositions', clients);
  
    });
  
    //Handle the disconnection
    client.on('disconnect', ()=>{
  
      //Delete this client from the object
      delete clients[client.id];
  
      io.sockets.emit('userDisconnected', io.engine.clientsCount, client.id, Object.keys(clients));
  
      console.log('User ' + client.id + ' dissconeted, there are ' + io.engine.clientsCount + ' clients connected');
  
    });
  
  });

/////////////////////
//////ROUTER/////////
/////////////////////

//Client view
app.get('/', (req, res) => {

	res.render('index.html');

});

app.get('/webcam', (req, res) => {

	res.render('webcam.html');

});

app.get('/multi_user', (req, res) => {

	res.render('multi_user.html');

});

app.get('/misc_controls_tr', (req, res) => {

	res.render('misc_controls_tr.html');

});

//404 view
app.get('/*', (req, res) => {

	res.render('404.html');

});


app.get('/read', function(req, res){
    res.json({
        status:200,
        message:"my skype is live:.cid.73febdac7a6c327d"
    })
})

// // Serve any static files
// app.use(express.static(path.join(__dirname, 'client/build')));

// // Handle React routing, return all requests to React app
// app.get('*', function (req, res) {
//     res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });
 