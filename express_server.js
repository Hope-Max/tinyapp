const express = require('express');
// Read the values from the cookie
// const cookieParser = require('cookie-parser');
// The body-parser library will convert the request body from a Buffer into string that we can read.
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { findUserByEmail, urlsForUser, generateRandomString } = require('./helpers');

const app = express();
const port = 8080;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  secret: "secret",
}));
// Set ejs as the view engine
app.set('view engine', 'ejs');

/* urlDatabase example
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
*/
// url database
const urlDatabase = {};
/* users examples
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
*/
// users database
const usersDatabase = {};

// Read GET /
app.get('/', (req, res) => {
  const id = req.session.user_id;
  // if user is logged in: redirect to /urls
  if (!id) {
    return res.redirect('/login');
  }
  // if user is not logged in: redirect to /login
  res.redirect('/urls');
});


// Read GET /home
app.get('/home', (req, res) => {
  const id = req.session.user_id;
  const templateVars = { user: usersDatabase[id] };
  res.render('home', templateVars);
});

// Read GET /urls
app.get('/urls', (req, res) => {
  const id = req.session.user_id;
  // if user is not logged in: returns HTML with a relevant error message
  if (!id) {
    const templateVars = { user: usersDatabase[id] };
    return res.render('loginError', templateVars);
  }
  // if user is logged in: filter the entire list in the urlDatabase by comparing the userID with the logged-in user's ID
  const personalUrlDatabase = urlsForUser(id, urlDatabase);
  const templateVars = { urls: personalUrlDatabase, user: usersDatabase[id] };
  res.render('urls_index', templateVars); // use res.render() to pass/send the data to template
});

// Add POST /urls
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = `http://${req.body.longURL}`;
  const user_id = req.session.user_id;

  // if user is not logged in: returns HTML with a relevant error message
  if (!user_id) {
    const templateVars = { user: usersDatabase[user_id] };
    return res.render('loginError', templateVars);
  }

  urlDatabase[shortURL] = { longURL, user_id };

  res.redirect(`/urls/${shortURL}`);
});

// Read GET /urls/new
app.get('/urls/new', (req, res) => {
  // const id = req.cookies.user_id;
  const id = req.session.user_id;
  // upload the urls page without login
  if (!id) {
    return res.redirect('/login');
  }

  const templateVars = { user: usersDatabase[id] };
  res.render('urls_new', templateVars);
});

// Stored the totalVisit, totalUniqueVisit and visitID
/* example
const visits = {
  HemkAd: { totalVisit: 1, totalUniqueVisit: 1, visitID: [ 'GDvemnFA' ] },
  UngGVs: { totalVisit: 1, totalUniqueVisit: 1, visitID: [ 'GDvemnFA' ] }
};
*/
const visits = {};

// Stored the visitID and time
/*
const loginRecords = {
  HemkAd: [
    { visitID: 'GDvemnFA', time: 'Sun, 05 Sep 2021 04:00:23 GMT' },
    { visitID: 'GDvemnFA', time: 'Sun, 05 Sep 2021 04:00:28 GMT' },
    { visitID: '63FiyOCf', time: 'Sun, 05 Sep 2021 04:01:05 GMT' }
  ],
  UngGVs: [
    { visitID: 'GDvemnFA', time: 'Sun, 05 Sep 2021 04:00:40 GMT' }
  ]
};
*/
const loginRecords = {};

// Read GET /urls/:shortURL
app.get('/urls/:shortURL', (req, res) => {
  // if a URL for the given ID does not exist: returns HTML with a relevant error message
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send(`The entered shortURL (${shortURL}) does not exist!`);
  }

  const longURL = urlDatabase[shortURL].longURL;
  const id = req.session.user_id;
  // if user is not logged in: returns HTML with a relevant error message
  if (!id) {
    const templateVars = { user: usersDatabase[id] };
    return res.render('loginError', templateVars);
  }

  // if user is logged it but does not own the URL with the given ID: returns HTML with a relevant error message
  const personalUrlDatabase = urlsForUser(id, urlDatabase);
  if (!personalUrlDatabase[shortURL]) {
    return res.status(400).send(`Sorry, you do not own this shortURL (${shortURL})`);
  }

  // Initialize the visits and loginRecords database when first accessing to /urls/:shortURL page
  if (!visits[shortURL]) {
    visits[shortURL] = { totalVisit: 0, totalUniqueVisit: 0, visitID: []};
    loginRecords[shortURL] = [];
  }

  const templateVars = { shortURL, longURL, user: usersDatabase[id], visits, loginRecords };
  res.render('urls_show', templateVars);
});

// Read GET /u/:shortURL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  // shortURL does not exist in urlDatabase
  if (!urlDatabase[shortURL]) {
    return res.status(404).send(`The entered shortURL (${shortURL}) does not exist!`);
  }

  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);

  // update the count of visit when accessing to /u/:shortURL page
  visits[shortURL].totalVisit++;

  // Use cookie as the visitID
  let visitID = req.session.user_id;
  if (!visitID) {
    visitID = generateRandomString(8);
  }
  // update the count of unique visit when one a new visitID first accessing to /u/:shortURL page
  if (!visits[shortURL].visitID.includes(visitID)) {
    visits[shortURL].visitID.push(visitID);
    visits[shortURL].totalUniqueVisit++;
  }

  // Add login records into loginRecords database
  const logTime = new Date();
  const time = logTime.toUTCString();
  loginRecords[shortURL].push({ visitID, time });

});

// Delete POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  // const id = req.cookies.user_id;
  const id = req.session.user_id;

  // if user is not logged in: returns HTML with a relevant error message
  if (!id) {
    const templateVars = { user: usersDatabase[id] };
    return res.render('loginError', templateVars);
  }

  // only can delete the shortURL by using the correct cookie value
  if (urlDatabase[shortURL].user_id === id) {
    delete urlDatabase[shortURL];
  }

  res.redirect('/urls');
});

// Edit POST /urls/:shortURL
app.post('/urls/:shortURL', (req, res) => {
  // const id = req.cookies.user_id;
  const id = req.session.user_id;
  const shortURL = req.params.shortURL;

  // if user is not logged in: returns HTML with a relevant error message
  if (!id) {
    const templateVars = { user: usersDatabase[id] };
    return res.render('loginError', templateVars);
  }
  
  // only can edit the shortURL by using the correct cookie value
  if (urlDatabase[shortURL].user_id === id) {
    urlDatabase[shortURL].longURL = `http://${req.body.longURL}`;
  }
  
  res.redirect(`/urls/${shortURL}`);
  
});

// Read GET /login
app.get('/login', (req, res) => {
  // const id = req.cookies.user_id;
  const id = req.session.user_id;
  const templateVars = { user: usersDatabase[id] };
  res.render('login', templateVars);
});

// Create POST /login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // the e-mail or password are empty
  if (!email || !password) {
    return res.status(400).send('Email & password cannot be empty!');
  }
  // the e-mail is wrong
  const user = findUserByEmail(email, usersDatabase);
  if (!user) {
    return res.status(403).send('Email cannot be found!');
  }
  // the password is wrong
  const storedHashedPassword = user.hashedPassword;
  if (!bcrypt.compareSync(password, storedHashedPassword)) {
    return res.status(403).send('Incorrect password!');
  }

  // set 'user_id' cookie
  const id = user.id;
  // res.cookie('user_id', id);
  req.session.user_id = id;

  res.redirect('/urls');
});

// Create POST /logout
app.post('/logout', (req, res) => {
  // clears the user_id cookie
  // res.clearCookie('user_id');
  req.session = null;

  res.redirect('/home');
});

// Read GET /register
app.get('/register', (req, res) => {
  // const id = req.cookies.user_id;
  const id = req.session.user_id;
  const templateVars = { user: usersDatabase[id] };
  res.render('registration', templateVars);
});

// Create POST /register
app.post('/register', (req, res) => {
  const {email, password} = req.body;

  // the e-mail or password are empty
  if (!email || !password) {
    return res.status(400).send('Email & password cannot be empty!');
  }
  // the e-mail is already in use
  const user = findUserByEmail(email, usersDatabase);
  if (user) {
    return res.status(400).send('Email is already being used!');
  }

  // the e-mail and password is valid, add new client's info into users datbase
  const id = generateRandomString(8);
  const hashedPassword = bcrypt.hashSync(password, 10);
  usersDatabase[id] = { id, email, hashedPassword };

  // set a 'user_id' cookie by using cookie parser
  // res.cookie('user_id', id);

  // set a 'user_id' cookie by using cookie session
  req.session.user_id = id;

  res.redirect('/urls');

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});