// Add dependencies
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const utils = require('./utils.js');
const server = require('http').createServer(app);
const socket = require('socket.io');
const io = socket(server);
const morgan = require('morgan');
const users = [];

//Database Dependences Below
const db = require('../db/users.js');
const townhalls = require('../db/townhalls.js');
//**********************************************

const apiHelpers = require('../lib/apiHelper.js');
const dataHelpers = require('../lib/dataHelpers.js')
const apiSearch = require('../lib/apiSearch.js');
const apiSearch2 = require('../lib/apiSearch2.js');
const config = require('../config/civic.js');
const path = require("path");
/************************************************
Passport Related (Below)
************************************************/

app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const passport = require('passport');
const passportSetup = require('../config/passport-setup.js');

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser(config.SESSION_SECRET));

/************************************************/

app.use(express.static(`${__dirname}/../client/dist`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json()); // This should be adjusted towards the type of req.body we will get
// app.use(bodyParser.text()); //or some other type
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
//for online users
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));
app.use(express.static(path.resolve(__dirname, '..', 'build')));

const port = process.env.PORT || 3000;

//*********live-chat ***********//
io.on('connection', (client) => {
  console.log(client.id);
  console.log('socket io connection online!');
  client.on('send_message', function(data) {
    console.log('message from client received data:', data)
    io.emit('receive_message', data);
  })
});
socket.set('nickname', 'Guest');
 server.listen(port, () => {
  console.log(`server listening from ${port}!`)
});

//*********online users*************//
// app.get('/', (req,res) => {
//   res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
// });

// io.on('connection', function(socket) {
//   var online = Object.keys(io.engine.clients);
//   io.emit('server message', JSON.stringify(online));

//   socket.on('disconnect', function(){
//     var online = Object.keys(io.engine.clients);
//     io.emit('server message', JSON.stringify(online));
//     });
// });
// server.listen(port, () => console.log(`server listening from ${port}!`));
// server.listen(port, function () {
//   console.log('Server listening on port %d', port);
// });

// io.on('connection', function (socket) {
//     socket.on('new user', function(name, callback){
//         if(name.length > 0){
//             if(users.indexOf(name) == -1){
//                 socket.username = name;
// //socket.join('football-room');
//                 users.push(socket.username);
//                 updateUsers();
//                 callback(true);
//             } else{
//                 callback(false);
//             }
//         }
//     });


//     socket.on('new message', function(msg){
//         var sender = socket.username;
//         var message = msg;
//         io.emit('push message', {name: sender, msg: message});
//     });

//     function updateUsers(){
//         io.emit('users', users);
//     }

//     socket.on('disconnect',function(){
//         if(socket.username){
//             users.splice(users.indexOf(socket.username),1);
//             updateUsers();
//         }
//     });
// });

// ////******route requests*********///

app.post('/login', (req, res, next) => {
  console.log(req.body);
});
// DESCRIPTION: This will respond to user input on the front-end and send back the appropriate data. req.body will be our friend here.
// STATUS: to be integrated with front end

app.post('/reps', (req, res, next) => {

  console.log("POST to /saveUser, req.body is", req.body);
  const locator = req.body.zip ? req.body.zip
                  : req.body.location ? dataHelpers.abbrState(req.body.location, 'name')
                  : null;
  const region = req.body.region;

  apiSearch.searchByZip(locator, (response) => {
    if (response.error) {
      res.send(JSON.stringify('Please enter valid ZIP code.'));
    } else {
      res.status(201);
      console.log(response);
      res.send(apiHelpers.getOfficials(region, response));
    }
  });
});

app.get('/voterinfo', (req, res, next) => {
  // console.log("Get to API", req.query.address);
  // console.log("Get to API", req.param('address'));
  const address = req.param('address');

  apiSearch2.searchByAddress(address, (response) => {
    if (response.error) {
      res.send(response.error);
    } else {
      res.status(201);
      console.log(response);
      res.send(response);
    }
  });
});

app.post('/townhall', utils.authCheck, (req, res, next) => {
  console.log('req received')
})
/******************************************************************************
Name: Passport Authentication Routes
Description:   Will determine the routes to direct user to and send them back
               upon authentication.
******************************************************************************/
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('req.user is', req.user);
    res.redirect('/');
  });

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
})

app.get('/test', utils.authCheck, (req, res) => {
  console.log('passed authCheck');
  res.send(req.user);
});


//Temp function for Mubeen front-end prior to RR implementation
app.get('/checkuser', utils.authCheck, (req, res) => {
  console.log('passed authcheck')
  req.user ? res.send(req.user) : res.send('whoops');
});


/******************************************************************************
Name:  React Router Redirect Routes
Description:  Implements the ability to directly access a component via url
              (e.g. localhost:3000/someUrl)
*******************************************************************************/


app.get('/main', function(req, res) {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  });
});


app.get('/townhall', function(req, res) {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  });
});


app.get('/dashboard', function(req, res) {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  });
});


app.get('/map', function(req, res) {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  });
});


app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  });
});


app.get('/zip', function(req, res) {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  });
});

app.get('/chat', function (req, res) {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'), function (err) {
    if (err) {
      res.status(500).send(err)
    }
  });
});

/******************************************************************************
Name:  TownHall Query Routes
Description:  Implements the ability to access data from the database for the
              townhall
*******************************************************************************/
app.get('/alltownhalls', function(req, res) {
  console.log('alltownhalls GET')
  townhalls.getNames()
    .then(names => res.send(names))
    .catch(err => {res.status(500).send(err)});
});

app.post('/create', (req, res) => {
  //console.log('createtownhall posted, ', req.body.townHallName)
  const townHallName = req.body.townHallName;
  townhalls.createTownHall(townHallName)

  res.send('createtown hall POST return')
})

app.post('/question', function(req, res) {
  const question = String(req.body.question);
  const hallName = String(req.body.townHallName);
  //change the user ID to be from hard coded to user id
  const userRowId = Number(req.body.userRowId);
  //
  console.log('question posted', req.body)
  //
  townhalls.createQuestion(question, userRowId, hallName).then(results => res.status(201).send(results));
});

app.get('/questions', function(req, res) {
  const townHallName = req.query.townHall;

    townhalls.getQuestions(townHallName)
       .then(questions => {
          console.log(questions);
          res.send(questions)
        })
       .catch(() => res.status(500).send());
});
