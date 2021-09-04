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

module.exports = { findUserByEmail, urlsForUser, generateRandomString };