const express = require('express');
// Read the values from the cookie
// const cookieParser = require('cookie-parser');
// The body-parser library will convert the request body from a Buffer into string that we can read.
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  secret: "secret",
}));

// Set ejs as the view engine
app.set('view engine', 'ejs');

const port = 8080;

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
const users = {};

// Generates a random 6-digit string consisting of numbers and lowercase letters
// const generateRandomString1 = function() {
//   return Math.random().toString(36).substr(2, 6);
// };

// Generates a random n-digit string consisting of numbers and uppercase or lowercase letters
const generateRandomString = function(n) {
  const arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 
'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 
'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  let str = '';

  for (let i = 0; i < n; i++) {
    const randomChar = arr[Math.round(Math.random() * (arr.length - 1))];
    str += randomChar;
  }
  return str;
};

// Generates a function to find whether a userID exists in database(users object) by inputting email
const findUserByEmail = function(email) {
  for (let id of Object.keys(users)) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// Generates a function to return the URLs where the user_id is equal to the id of the currently logged-in user
const urlsForUser = function(personalUserID) {
  const personalUrlDatabase = {};
  for (let shortURL of Object.keys(urlDatabase)) {
    if (urlDatabase[shortURL].user_id === personalUserID) {
      personalUrlDatabase[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return personalUrlDatabase;
}

// app.get('/', (req, res) => {
//   res.send('Hello!');// res.write() && res.send()
// });

// Add an additional endpoints
// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);// JSON.stringify() && res.send()
// });

// Add an additional endpoints with the response that contain HTML code
// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

// Read GET /urls
app.get('/urls', (req, res) => {
  // const id = req.cookies.user_id;
  const id = req.session.user_id;
  // upload the urls page without login
  if (!id) {
    return res.redirect('/login');
  }
  // filter the entire list in the urlDatabase by comparing the userID with the logged-in user's ID 
  const personalUrlDatabase = urlsForUser(id);
  const templateVars = { urls: personalUrlDatabase, user: users[id] };
  res.render('urls_index', templateVars); // use res.render() to pass/send the data to template
});

// Add POST /urls
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = `http://${req.body.longURL}`;
  // const user_id = req.cookies.user_id;
  const user_id = req.session.user_id;
  urlDatabase[shortURL] = { longURL, user_id };

  res.redirect('/urls');
});

// Add additional endpoints, this route handler will render the page with the form
app.get('/urls/new', (req, res) => {
  // const id = req.cookies.user_id;
  const id = req.session.user_id;
  // upload the urls page without login
  if (!id) {
    return res.redirect('/login');
  }

  const templateVars = { user: users[id] };
  res.render('urls_new', templateVars);
});

// Read GET /urls/:shortURL
app.get('/urls/:shortURL', (req, res) => {
  // const id = req.cookies.user_id;
  const id = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL

  // upload the urls page without login
  if (!id) {
    return res.redirect('/login');
  }
  
  const templateVars = { shortURL, longURL, user: users[id] };
  res.render('urls_show', templateVars);
});

// Read GET /u/:shortURL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  // shortURL does not exist in urlDatabase
  if (!urlDatabase[shortURL]) {
    res.statusCode = 404;
    return res.end('404 Page Not Found\n');
  }

  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// Delete POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  // const id = req.cookies.user_id;
  const id = req.session.user_id;

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
  const templateVars = { user: users[id] };
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
  const user = findUserByEmail(email);
  if (!user) {
    return res.status(403).send('Email cannot be found!')
  }
  // the password is wrong
  const storedHashedPassword = user.hashedPassword;
  if (!bcrypt.compareSync(password, storedHashedPassword)) {
    return res.status(403).send('Incorrect password!')
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

  res.redirect('urls');
});

// Read GET /register
app.get('/register', (req, res) => {
  // const id = req.cookies.user_id;
  const id = req.session.user_id;
  const templateVars = { user: users[id] };
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
  const user = findUserByEmail(email);
  if (user) {
    return res.status(400).send('Email is already being used!');
  }

  // the e-mail and password is valid, add new client's info into users datbase
  const id = generateRandomString(8);
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = { id, email, hashedPassword };

  // set a 'user_id' cookie by using cookie parser
  // res.cookie('user_id', id);

  // set a 'user_id' cookie by using cookie session
  req.session.user_id = id;

  res.redirect('/urls');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});