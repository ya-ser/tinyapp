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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    if(user.email === email) {
      return user;
    }
  }
  return null;
};

// ----------------------------  POST  ----------------------------

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


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
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
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const newURL = req.body.newURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newURL;
  res.redirect('/urls');
});

// ----------------------------  GET  ----------------------------

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
    urls: urlDatabase,
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
  const userId = req.cookies["username"];
  const user = users[userId];

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
    longURL: urlDatabase[req.params.shortURL],
    user: user
   };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies.username };
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL, templateVars);
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