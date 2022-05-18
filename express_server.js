const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")
const app = express();
const PORT = 8080; // default port 8080

//User Database
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
}

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

// Check function to verify if email address is already registered
function checkEmail(email, userDatabase) {
  for (const id in userDatabase) {
    if (userDatabase[id].email === email) {
      return true; //return true if email already in database
    }
  }
  return false 
}

app.set('view engine', 'ejs');


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Landing page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// Get login page
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]],urls: urlDatabase };
  res.render("urls_login", templateVars);
})

// Login when username is inputted
app.post("/login", (req, res) => {
  //res.cookie("username", req.body.username);
  res.redirect('/urls');
})

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
})

// Page for all current URLs in data base
app.get("/urls", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]],urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Generate random short URL strings after submitting a long URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL; // Set the long URL input from form to the corresponding short URL generate in database
  res.redirect(`/urls/${shortURL}`);  // Redirect to /urls/:shortURL
});

// User registration page
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]],urls: urlDatabase };
  res.render("urls_register", templateVars);
})

//Post submitted email and password to user database
app.post("/register", (req, res) => {
  if (req.body.email === "") {
    return res.status(400).send("Email address is empty.");
  }
  if (checkEmail(req.body.email, users)) {
    return res.status(400).send("Email address is already in use.");
  }
  const userID = generateRandomString();
  
  users[userID] = {
    'id': userID,
    'email': req.body.email,
    'password': req.body.password
  };
  res.cookie("user_id", userID);
  res.redirect("/urls");
})

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
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
  const templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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