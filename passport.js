const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
  usernameField: 'Username',
  passwordField: 'Password'
}, async (username, password, callback) => {
  try {
    console.log('Authenticating user:', username);
    const user = await Users.findOne({ Username: username });
    if (!user) {
      console.log('User not found:', username);
      return callback(null, false, { message: 'Incorrect username or password.' });
    }

    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      console.log('Incorrect password for user:', username);
      return callback(null, false, { message: 'Incorrect username or password.' });
    }

    console.log('User authenticated successfully:', username);
    return callback(null, user);
  } catch (error) {
    console.log('Error during authentication:', error);
    return callback(error);
  }
}));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'your_jwt_secret'
}, async (jwtPayload, callback) => {
  try {
    const user = await Users.findById(jwtPayload._id);
    if (user) {
      return callback(null, user);
    } else {
      return callback(null, false);
    }
  } catch (error) {
    return callback(error);
  }
}));