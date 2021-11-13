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

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "userRandomID"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "userRandomID"
  }
};

const queryUrlDatabase = function(id, obj) {
  const tempObj = {};
  for (let i in obj) {
    if (obj[i]["userID"] === id) {
      tempObj[i] = urlDatabase[i]['longURL'];
    }
  }
  return tempObj
}

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "1234"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "1234"
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
  const idKey = req.cookies["user_id"];
  const user = users[idKey];
  // const user = req.cookies["user_id"];
  // const templateVars = { urls: urlDatabase,
  // user};
  console.log(user);
  const result = queryUrlDatabase(idKey, urlDatabase);
  console.log(result);
  const templateVars = { urls: result,
    user};
  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = {
    user_id: req.cookies["user_id"],
    user
  };
  console.log(templateVars);
  if (!user) {
   return res.redirect("/login");
  } 
  if (!user['id']) {
    return res.redirect("/login");
  } 
    res.render("urls_new", templateVars);
  
});

app.get("/urls/:shortURL", (req, res) => {
  const idKey = req.cookies["user_id"];
  const user = users[idKey]
  const shortURL = req.params.shortURL;
  //const longURL = urlDatabase[shortURL];
  const result = queryUrlDatabase(idKey, urlDatabase);
  const longURL = result[shortURL];
  console.log(longURL); 
  const templateVars = { shortURL: shortURL, longURL: longURL, user};
  if (!user) {
   return res.redirect("/login");
  } 
  if (!users[idKey]) {
   return res.redirect("/login");
  } 
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

app.get("/login", (req, res) => {
  const templateVars = {user:null};
  res.render("login", templateVars);
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]};
  //res.send(urlDatabase); 
  res.redirect(`/urls/${shortURL}`)        
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/sub", (req, res) => {
  if (req.body.longURL !== "") {
    urlDatabase[req.params.shortURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]}
  }
  res.redirect("/urls");
}); 

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailLookup(email);
  console.log('test1', user);
  if (user) {
    if (user.password === password) {
    console.log('test2', user.id);
    res.cookie('user_id', user.id);
    res.redirect("/urls");
    } else {
      return res.status(403).send("Wrong Email or Password");
    }
  } else {
    return res.status(403).send("Email not found.");
  }
  // res.cookie('user_id', req.cookies.user_id);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls");
});

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
  users[userId] = { // refactored with mentors
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


