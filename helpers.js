// Generates a function to find whether a userID exists in database(users object) by inputting email
const findUserByEmail = function(email, usersDatabase) {
  for (let id of Object.keys(usersDatabase)) {
    const user = usersDatabase[id];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

// Generates a function to return the URLs where the user_id is equal to the id of the currently logged-in user
const urlsForUser = function(personalUserID, urlDatabase) {
  const personalUrlDatabase = {};
  for (let shortURL of Object.keys(urlDatabase)) {
    if (urlDatabase[shortURL].user_id === personalUserID) {
      personalUrlDatabase[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return personalUrlDatabase;
};

// Generates a random n-digit string consisting of numbers and uppercase or lowercase letters
const generateRandomString = function(n) {
  const letters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let str = '';

  for (let i = 0; i < n; i++) {
    const randomChar = letters[Math.round(Math.random() * (letters.length - 1))];
    str += randomChar;
  }
  return str;
};

module.exports = { findUserByEmail, urlsForUser, generateRandomString };