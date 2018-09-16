const express = require("express");
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')

// Load user Model
const User = require('../../models/User');

// @Route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Users Works" }));

// @Route   GET api/users/register
// @desc    Register User
// @access  Public
router.post('/register',(req, res)=>{
  User.findOne({ email: req.body.email })     // Search for a email in the DB
    .then(user => {
      if(user){               // If exists an user with that email return an error
        return res.status(400).json({email: 'Email already exists'});
      } else {                  // Else, create a new user
        const avatar = gravatar.url(req.body.email, {
          s: '200',  // Size
          r: 'pg',   // Rating
          d: 'mm'   // Default
        });

        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password
        });

        bcrypt.genSalt(10, (err,salt)=>{
          bcrypt.hash(newUser.password, salt, (err, hash)=> {
            if(err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          });
        });
      }
    })
});

// @Route   GET api/users/login
// @desc    Login User /  Returning JWT Token
// @access  Public
router.post('/login',(req,res)=>{
  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({email})
    .then(user => {
      // Check for user
      if(!user){
        return res.status(404).json({email: 'User email not found'});
      }

      // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
          if(isMatch){
            res.json({msg: 'Success'});
          } else {
            return res.status(400).json({password: 'Password Incorrect'})
          }
        })
    })
});

module.exports = router;