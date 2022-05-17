const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080

//Generate random 6-characters string
function generateRandomString() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const length = 6;
  let randomString = '';
  for (let i = 1; i <= length; i++) {
    randomString += chars[Math.floor(Math.random() * (chars.length - 1))];
  }
  return randomString;
}


app.set('view engine', 'ejs');


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(bodyParser.urlencoded({extended: true}));

// Landing page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Page for all current URLs in data base
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL; // Set the long URL input from form to the corresponding short URL generate in database
  res.redirect(`/urls/${shortURL}`);  // Redirect to /urls/:shortURL
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL); // redirect to long URL page
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.body, req.params);
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls/");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});