const { response } = require("express");// page was not loading without this
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
      longURL: "http://www.lighthouselabs.ca",
      userID: "b2xVn2"
  },
  i3BoGr: {
      longURL: "http://www.google.com",
      userID: "9sm5xK"
  }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "1234"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "asdf"
  }
};

// ----------------------------  FUNCTIONS  ----------------------------

function generateRandomString() {
  return (Math.random() + 1).toString(36).substring(7);
};

const findUserByEmail = (email) => {
  for(const userId in users) {
    const user = users[userId];
    //checking if user has email in the first place and seeing if that email is equal to the one we're passing in the for loop
    if(user.hasOwnProperty("email") && user.email === email) {
      return user;
    }
  }
  return null;
};

const userURL = (userId) => {
  let result = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userId) {
      result[shortURL] = urlDatabase[shortURL];
    }
    // compare userid of each urldatabase with the userid arguement
      // if the userid matches with the 
        // push to result object
  }
  return result;
};

// ----------------------------  POST  ----------------------------

app.post("/login", (req, res) => {
  // creates a random string and assigns it as the new username
  const newEmail = req.body.email;
  const newPassword = req.body.password;

  const user = findUserByEmail(newEmail);

  if(!user){
    res.cookie("loginerror", "a user with that email does not exist");
    res.redirect("/login")
    // return res.status(400).send("a user with that email does not exist")
  };

  if(user.password !== newPassword) {
    res.cookie("loginerror", "password does not match");
    res.redirect("/login")
    // return res.status(400).send('password does not match')
  };
  res.clearCookie('loginerror');
  res.cookie("username", user.id);
  // routes user back to /urls logged in as the user who registered
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  // creates a random string and assigns it as the new username
  const newEmail = req.body.email;
  const newPassword = req.body.password;

  const user = findUserByEmail(newEmail);

  if(user) {
    return res.status(400).send("a user already exists with that email")
  };
  const userId = generateRandomString();
  users[userId] = {
    "id": userId,
    "email": newEmail,
    "password": newPassword
  };
  // saves the users info (id, email, and pwd)
  res.cookie("username", userId);
  // routes user back to /urls logged in as the user who registered
  res.redirect("/urls");
});

app.post("/urls/new", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["username"]
  };
  // console.log("url", urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls/');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  const userId = req.cookies["username"];
  // check userID from cookies if they match with userID in database
    // if they match, delete url
    // else redirect user to /urls
  if (userId === urlDatabase[shortURL].userId) {
    // prevents others from deleting shorts if they are not the user logged in
    delete urlDatabase[shortURL];
  };
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const newURL = req.body.newURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = newURL;
  res.redirect('/urls');
});

// ----------------------------  GET  ----------------------------

app.get('/login', (req, res) => {
  const userId = req.cookies["username"];
  const loginError = req.cookies["loginerror"];
  const user = users[userId];
  const templateVars = {
    user: user,
    loginError: loginError
  };
  res.render('login', templateVars);
});

app.get('/register', (req, res) => {
  // const userId = req.cookies["username"];
  // const user = users[userId];

  const templateVars = {
    user: null
  };
  res.render('registration', templateVars);
});

app.get('/urls', (req, res) => {
  const userId = req.cookies["username"];
  const user = users[userId];

  const templateVars = {
    urls: userURL(userId),
    user: user
  };
  res.render('urls_index', templateVars);
});

// app.get('/urls', (req, res) => {
//   const templateVars = {
//     urls: urlDatabase,
//     username: req.cookies.username
//   };
//   res.render('urls_index', templateVars);
// });

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
// if user is not logged in
  // redirect to login screen
  const userId = req.cookies["username"];
  const user = users[userId];

  if (!user) {
    res.redirect("/login");
  };

  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["username"];
  const user = users[userId];
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: user
   };
  res.render("urls_show", templateVars);
});

// app.get("/u/:shortURL", (req, res) => {
//   const templateVars = { username: req.cookies.username };
//   const longURL = urlDatabase[req.params.shortURL].longURL
//   res.redirect(longURL, templateVars);
// });

app.get("/u/:id", (req, res) => {
  //makes request to check for the longURL in stored in database using the shortURL
  const longURL = urlDatabase[req.params.id].longURL
  // redirects user to the long url page
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  const templateVars = { username: req.cookies.username };
  res.json(urlDatabase, templateVars);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});