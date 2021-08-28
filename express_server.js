const express = require('express');
const app = express();
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

// The body-parser library will convert the request body from a Buffer into string that we can read.
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// Set ejs as the view engine
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Hello!');// res.write() && res.send()
});

// Add an additional endpoints
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);// JSON.stringify() && res.send()
});

// Add an additional endpoints
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars); // use res.render() to pass/send the data to template
});

// Add additional endpoints, this route handler will render the page with the form
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

// Add an additional endpoints
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

// Add an additional endpoints with the response that contain HTML code
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});