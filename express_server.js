const express = require('express');
const cookieParser = require('cookie-parser');
// The body-parser library will convert the request body from a Buffer into string that we can read.
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const port = 8080;

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

// Set ejs as the view engine
app.set('view engine', 'ejs');

const urlDatabase = {};

// app.get('/', (req, res) => {
//   res.send('Hello!');// res.write() && res.send()
// });

// Add an additional endpoints
// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);// JSON.stringify() && res.send()
// });

// Add an additional endpoints with the response that contain HTML code
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// Read GET /urls
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render('urls_index', templateVars); // use res.render() to pass/send the data to template
});

// Add POST /urls
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = `http://${req.body.longURL}`;
  // console.log(req.body);  // Log the POST request body to the console
  // res.send('Ok');         // Respond with 'Ok' (we will replace this)
  res.redirect('/urls');
});

// Add additional endpoints, this route handler will render the page with the form
app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies['username']};
  res.render('urls_new', templateVars);
});

// Read GET /urls/:shortURL
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies['username'] };
  res.render('urls_show', templateVars);
});

// Read GET /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.statusCode = 404;
    return res.end('404 Page Not Found\n');
  }
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// Delete POST /urls/:shortURL/delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Edit POST /urls/:shortURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = `http://${req.body.longURL}`;
  res.redirect(`/urls/${shortURL}`);
});

// Add POST /login
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);// set a cookie
  res.redirect("/urls");
});

// Add POST /logout
app.post("/logout", (req, res) => {
  res.clearCookie('username'); // clears the username cookie
  res.redirect('urls');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});