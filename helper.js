// Return user with matching email address from database
const getUserByEmail = function(email, database) {
  for (const id in database) {
    if (database[id].email === email) {
      return database[id].id; //return id email matches
    }
  }
  return null; // if not found return null
};

// Check to verify if email address is already registered
const checkEmail = function(email, userDatabase) {
  for (const id in userDatabase) {
    if (userDatabase[id].email === email) {
      return true; //return true if email already in database
    }
  }
  return false;
};

// Generate random 6-characters string
const generateRandomString = function() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const length = 6;
  let randomString = '';
  for (let i = 1; i <= length; i++) {
    randomString += chars[Math.floor(Math.random() * (chars.length - 1))];
  }
  return randomString;
};

// Function to return URLs from database that belongs to a user
const urlsForUser = function(id, userDatabase) {
  let urls = [];
  for (const shortURL in userDatabase) {
    if (id === userDatabase[shortURL].userID) {
      urls.push(shortURL);
    }
  }
  return urls;
};

// Function to check user ID cookies to verify whether user logged in
const checkLoginCookies = function(cookie, res) {
  if (!cookie) {
   return res.status(401).send('Unauthorized Request. Please log in.');  // Return unauthorized request if user is not logged in
  }
 };

module.exports = {getUserByEmail, checkEmail, generateRandomString, urlsForUser, checkLoginCookies};