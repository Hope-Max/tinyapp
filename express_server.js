const express = require('express');
const app = express();
const port = 8080;

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

// Add an additional endpoints with the response that contain HTML code
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});