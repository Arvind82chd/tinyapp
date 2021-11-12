const express = require("express");
const app = express();
const PORT = 3000; // default port 3000
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require('morgan');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs") 
app.set(morgan('dev'));

function generateRandomString() { 
  let randomString = '1234567890abcdefghijklmnopqrstuvwxyz'; //learn't a new way from a mentor.
  let shortString = '';
  for (let i = 0; i < 6; i++) { 
   shortString += randomString.charAt(Math.floor(Math.random() * randomString.length))
  }
  return shortString;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

function emailLookup(email) {
  for (let userId in users) {
    console.log(users[userId]);
    if (email === users[userId].email){
      return users[userId];
    }
  }
  return false;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]]

  // const user = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase,
  user};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = {
    // user_id: req.cookies["user_id"],
    // ... any other vars
    user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL: shortURL, longURL: longURL, user};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {user:null}; 
  res.render("register", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  //res.send(urlDatabase); 
  res.redirect(`/urls/${shortURL}`)        
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/sub", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect("/urls");
}); 

app.post("/login", (req, res) => {
  // res.cookie('user_id', req.cookies.user_id);
   res.cookie('user_id', req.body.user_id);
  // const username = req.body.username;
  // res.cookie('username', username);
  console.log('test', req.body.user_id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls");
});
//Take email & password from /register page and save them to users object.
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Email or Password not valid.");   
  }
  
  const validEmail = emailLookup(email);
  if (validEmail) {
    return res.status(400).send("Email already in use.");
  }
  const userId = generateRandomString();
  users[userId] = { // refactored
    id: userId,
    email: email,
    password: password 
  }
  console.log(users);
  res.cookie('user_id', userId);
  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


