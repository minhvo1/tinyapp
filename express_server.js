const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")
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
app.use(cookieParser());

// Login when username is inputted
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('/urls');
})

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
})

// Landing page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Page for all current URLs in data base
app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"],urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL; // Set the long URL input from form to the corresponding short URL generate in database
  res.redirect(`/urls/${shortURL}`);  // Redirect to /urls/:shortURL
});

app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["username"],urls: urlDatabase };
  res.render("urls_register", templateVars);
})

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL); // redirect to long URL page
});

app.post("/u/:shortURL", (req, res) => {
  const newLongURL = req.body.longURL;
  urlDatabase[req.params.shortURL] = newLongURL;
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls/");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});