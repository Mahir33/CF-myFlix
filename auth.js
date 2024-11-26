const jwtSecret = 'your_jwt_secret';
const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport'); // Your local passport file

const generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: '7d',
    algorithm: 'HS256'
  });
}

// POST login.
module.exports = (router) => {
  router.post('/login', (req, res) => {
    console.log('Login request received:', req.body);
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error) {
        console.log('Error during authentication:', error);
        return res.status(400).json({
          message: 'Something is not right',
          error: error
        });
      }
      if (!user) {
        console.log('Authentication failed:', info);
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          console.log('Error during login:', error);
          res.send(error);
        }
        const token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}