const express = require("express");
const bodyParser = require("body-parser");
//const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // Default port 8080

//User Database
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "1"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// Hash all current passwords in existing database
for (const user in users) {
  users[user].password = bcrypt.hashSync(users[user].password, 10)
}

// New URL Database
const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};

// Generate random 6-characters string
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
  return false;
};

// Function to return URLs from database that belongs to a user
function urlsForUser(id, userDatabase) {
  let urls = [];
  for (const shortURL in userDatabase) {
    if (id === userDatabase[shortURL].userID) {
      urls.push(shortURL);
    }
  }
  return urls;
};

app.set('view engine', 'ejs');
// Set up middlewares
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  secret: 'secret',
  maxAge: 24 * 60 * 60 * 1000
}));


// Landing page redirecting to /urls
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// Get login page
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id],urls: urlDatabase };
  res.render("urls_login", templateVars);
})

// Login when email address and password is inputted
app.post("/login", (req, res) => {
  if (!checkEmail(req.body.email, users)) {
    return res.status(403).send("Email address not found.");
  }
  let userID = "";
  for (const id in users) {
    if (users[id].email === req.body.email) {
      userID = id;
      if (!bcrypt.compareSync(req.body.password, users[id].password)) {
        return res.status(403).send("Email address and password do not match.");
      }
    }
  }
  req.session.user_id = userID;
  res.redirect('/urls');
})

// Logout; clears cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
})

// Page for all current URLs in data base
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  const templateVars = { user: users[req.session.user_id],urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Generate random short URL strings after submitting a long URL
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send('Unauthorized Request. Please log in.');
    return;
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL; // Set the long URL input from form to the corresponding short URL generate in database
  urlDatabase[shortURL].userID = req.session.user_id;
  res.redirect(`/urls/${shortURL}`);  // Redirect to /urls/:shortURL
});

// User registration page
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id],urls: urlDatabase };
  res.render("urls_register", templateVars);
})

// Post submitted email and password to user database
app.post("/register", (req, res) => {
  if (req.body.email === "") {
    return res.status(400).send("Email address is empty."); // Error if email is empty
  }
  if (checkEmail(req.body.email, users)) {
    return res.status(400).send("Email address is already in use."); // Error if email is already used
  }
  // Generates random userID string
  const userID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  // Add new user info to database
  users[userID] = {
    'id': userID,
    'email': req.body.email,
    'password': hashedPassword
  };
  req.session.user_id = userID;
  res.redirect("/urls");
})

// Add a new long URL to be shortened
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send('Unauthorized Request. Please log in.');
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

// Redirect to long URL page
app.get("/u/:shortURL", (req, res) => {
  // Check if short URL id is valid in database
  if (urlDatabase[req.params.shortURL] === undefined) {
    return res.status(404).send("Cannot find the requested short URL.");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// After editing the long URL, redirects to long URL
app.post("/u/:shortURL", (req, res) => {
  const newLongURL = req.body.longURL;
  urlDatabase[req.params.shortURL].longURL = newLongURL;
  res.redirect("/urls");
});

// Showing individual URL and edit function
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send('Unauthorized Request. Please log in.');
  }
  let validURLs = urlsForUser(req.session.user_id, urlDatabase);
  if (!validURLs.includes(req.params.shortURL)) {
    return res.status(401).send('The requested URL does not exist.'); // Error if the requested URL does not exist for user
  }
  const templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});

// URL edit function
app.post("/urls/:shortURL/edit", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send('Unauthorized Request. Please log in.');
    return;
  }
  res.redirect(`/urls/${req.params.shortURL}`);
})

// URL delete function
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send('Unauthorized Request.');
    return;
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/");
})

app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`);
});