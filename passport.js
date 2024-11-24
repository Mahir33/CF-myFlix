const passport = require('passport'),
LocalStrategy = require('passport-local').Strategy,
Models = require('./models.js'),
passportJWT = require('passport-jwt');

let Users = Models.User,
JWTStrategy = passportJWT.Strategy,
ExtractJWT = passportJWT.ExtractJwt;

passport.use(
    new LocalStrategy(
        {
            usernameField: 'Username',
            passwordField: 'Password',
        },
        async (username, password, callback) => {
            console.log(`${username} ${password}`);
            await Users.findOne({Username: username})
            .then(user => {
                if (!user) {
                    console.log('Incorrect username');
                    return callback(null, false, {message: 'Incorrect username.'});
                }
                console.log('Data are correct');
                
                return callback(null, user);
            }).catch(err => {
                if(err){
                    console.log('Error in database operation:', err);
                    return callback(err);
                }
            })
        }
    )
)

passport.use(new JWTStrategy(
    {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'your_jwt_secret',
    }, 
    async(jwtPayload, callback) => {
        return await Users.findById(jwtPayload._id)
        .then(user => {
            return callback(null, user);
    })
    .catch(err => {
        console.log('Error in JWT verification:', err);
        return callback(err, false);
    })
}
))