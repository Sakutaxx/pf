const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
if (/^[a-z0-9]{2,8}$/.test(username)) {
        for (const one of users) {
            if (one.username === username)
                return 0
        }
        return 1
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
for (const one of users) {
        if (one.username === username) {
            if (one.password === password) {
                return 1
            } else return 0
        }
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
    if (authenticatedUser(username, password)) {
        const token = jwt.sign(
            { data: password },
            'secretOrPrivateKey',
            { expiresIn: '1h' }
        );
        req.session.authorization = { token, username }
        return res.status(200).json({ message: `${username} successfully loggeg in` })
    }
    return res.status(400).json({ message: "Invalid username and/or password" })
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params['isbn']
        , user = req.session.authorization.username
        ;
    if (books[isbn]) {
        if (books[isbn]['reviews'][user]) {
            delete books[isbn]['reviews'][user];
            return res.status(200).json({
                message: `Review for the ISBN ${isbn} posted by ${user} has been deleted`
            })
        }
        return res.status(400).json({
            message: `No review by ${user} for the ISBN ${isbn}`
        })
    }
    return res.status(400).json({
        message: `No book is registered under ISBN ${isbn}`
    })
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
