const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');
const cors = require('cors');
const passport = require('passport');

require('./passport.js');

/**
 * @typedef {Object} Movie
 * @property {string} Title
 * @property {string} Description
 * @property {string} Genre
 * @property {string} Director
 * @property {string} ImagePath
 * @property {boolean} Featured
 */

/**
 * @typedef {Object} User
 * @property {string} Username
 * @property {string} Password
 * @property {string} Email
 * @property {Date} Birthday
 * @property {Array<string>} FavoriteMovies
 */

/**
 * @typedef {Object} Director
 * @property {string} Name
 * @property {string} Bio
 * @property {Date} Birth
 * @property {Date} Death
 */

/**
 * @typedef {Object} Genre
 * @property {string} Name
 * @property {string} Description
 */


const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Director;
const Genres = Models.Genre;

// const dbUrl = 'mongodb://127.0.0.1:27017/newMyFlixDB';

/**
 * Connects to the database using the connection URI stored in the .env file.
 * @constant {string} dbAtlasURL - The connection URI for the database.
 */

const dbAtlasURL = process.env.CONNECTION_URI;
mongoose.connect(dbAtlasURL, { useNewUrlParser: true, useUnifiedTopology: true });

// ---> Middleware <---

/**
 * List of allowed origins for CORS.
 * @constant {Array<string>} allowedOrigins - The list of allowed origins.
 */

let allowedOrigins = [
  'http://localhost:8080', 
  'http://localhost:1234',
  'https://ohmyflix.netlify.app',
  'http://localhost:4200',
];

/**
 * Middleware to handle CORS.
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      let message = "The CORS policy for this application doesn't allow access from origin " + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));


app.use(bodyParser.json());
app.use(morgan('common'));
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
require('./auth')(app);

/**
 * GET request to the homepage.
 * @name getHome
 * @function
 * @memberof module:routes
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Error handling middleware.
 * @function
 * @param {Object} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
    res.status(404).send('Not Found!');
})


// ------------- CRUD ---------------

// ---> CREATE <---

/**
 * POST request to add a new user.
 * @name createUser
 * @function
 * @memberof module:routes
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.post('/users', async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + ' already exists');
    } else {
      const birthday = new Date(req.body.Birthday);
      if (isNaN(birthday)) {
      return res.status(400).send('Invalid date format for Birthday');
      }
      return Users
        .create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
          FavoriteMovies: []
        })
        .then((user) => {res.status(201).json(user) })
      .catch((error) => {
        console.error(error);
        return res.status(500).send('Error: ' + error);
      })
    }
  })
  .catch((error) => {
    console.error(error);
    return res.status(500).send('Error: ' + error);
  });
});

// --- READ ---

/**
 * GET request to retrieve all movies.
 * @name getAllMovies
 * @function
 * @memberof module:routes
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get('/movies', async (req, res) => {
   await Movies.find()
   .populate('Genre')
  .populate('Director')
  .then((movies) => {
     res.json(movies);
  })
  .catch((err) => {
    res.status(404).send('Something went wrong');
  });
})

/**
 * GET request to retrieve API documentation.
 * @name getDocumentation
 * @function
 * @memberof module:routes
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get('/documentation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/documentation.html'));
})

/**
 * GET request to retrieve a single movie by title.
 * @name getMovieByTitle
 * @function
 * @memberof module:routes
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get('/movies/:Title', passport.authenticate('jwt', {session:false}), (req, res) => {
  Movies.findOne({"Title": req.params.Title})
  .then(movie => res.status(201).json(movie))
  .catch(err => res.status(404).send('Movie not found'));
});

/**
 * GET request to retrieve genre data by name.
 * @name getGenreByName
 * @function
 * @memberof module:routes
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get('/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  const genreName = req.params.Name;
  console.log("Searching for genre:", genreName);

  Genres.findOne({ "Name": { $regex: new RegExp(genreName, "i") } })
    .then(genre => {
      if (!genre) {
        console.log(`No movie found with genre: ${genreName}`);
        return res.status(404).send('Genre not found');
      }

      res.json({
        Name: genre.Name,
        Description: genre.Description
      });
    })
    .catch(err => {
      console.error("Error fetching genre:", err);
      res.status(500).send('An error occurred while fetching the genre');
    });
});

/**
 * GET request to retrieve director data by name.
 * @name getDirectorByName
 * @function
 * @memberof module:routes
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get('/directors/:Name', passport.authenticate('jwt', {session:false}), async (req, res) => {
  await Directors.findOne({ "Name": { $regex: new RegExp(req.params.Name, "i")}})
  .then(director => res.json(
    {
      Name: director.Name,
      Bio: director.Bio,
      Birth: director.Birth,
      Death: director.Death
    }
  ))
  .catch(err => res.status(404).send('Director not found'))
});


/**
 * @name getUserByUsername
 * @function
 * @memberof module:routes
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get('/users/:Username', 
  passport.authenticate('jwt', {session:false}), 
  async (req, res) => {
  
  if (req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }

  await Users.findOne({ Username: req.params.Username })
      .then((user) => {
          if (user) {
              res.json(user);
          } else {
              res.status(404).send('User with the username ' + req.params.Username + ' does not exist.'
              );
          }
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});


// ---- UPDATE ----

/**
 * PUT request to update a user's information.
 * @name updateUser
 * @function
 * @memberof module:routes
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.Username - The username of the authenticated user.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.Username - The new username.
 * @param {string} req.body.Password - The new password.
 * @param {string} req.body.Email - The new email.
 * @param {Date} req.body.Birthday - The new birthday.
 * @param {Object} res - The response object.
 * @returns {Object} The updated user object.
 * @throws {Error} If the user is not authenticated or if the update fails.
 */
app.put('/users/:Username', passport.authenticate('jwt', {session:false}), async (req, res) => {
  
    if(req.user.Username !== req.params.Username){
      return res.status(400).send('Permission denied');
    } 


    // Check if required fields are provided and are not empty
    const requiredFields = ['Username', 'Password', 'Email'];
    for (const field of requiredFields) {
        if (req.body.hasOwnProperty(field) && (!req.body[field] || req.body[field].length === 0)) {
            return res.status(400).send(`${field} is required and can not be empty.`);
        }
    }

    // Check if email is in a valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (req.body.Email && !emailRegex.test(req.body.Email)) {
        return res.status(400).send('Email is not in a valid format.');
    }

    await Users.findOneAndUpdate({ "Username": req.params.Username }, 
      { 
        $set:
        {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      { new: true })
      .then((updatedUser) => {
        return res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).send('Error: ' + err);
      })
});

/**
 * POST user - add favorite movie to list of favorite movies
 * @name addFavoriteMovie
 * @function
 * @memberof module:routes
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.post('/users/:Username/favorites', 
  passport.authenticate('jwt', {session:false}),  
  async (req, res) => {

    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }  

    await Users.findOneAndUpdate(
          { "Username": req.params.Username },
          {
              $push: { FavoriteMovies: req.body.FavoriteMovies },
          },
          { new: true }
      )
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// --- DELETE ---

/**
 * DELETE request to remove a favorite movie from a user's list of favorite movies.
 * @name removeFavoriteMovie
 * @function
 * @memberof module:routes
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.delete('/users/:Username/favorites/:MovieId', 
  passport.authenticate('jwt', {session:false}), 
  async (req, res) => {
    
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }  

    await Users.findOneAndUpdate(
        {
            Username: req.params.Username,
            FavoriteMovies: req.params.MovieId,
        },
        {
            $pull: { FavoriteMovies: req.params.MovieId },
        },
        { new: true }
    )
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


/**
 * DELETE request to deregister a user from the database.
 * @name deleteUser
 * @function
 * @memberof module:routes
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }

  Users.findOneAndDelete({ Username: req.params.Username })
    .then(deletedUser => {
      if (!deletedUser) {
        return res.status(404).send('User not found');
      }
      return res.status(200).send(`User ${req.params.Username} has been deleted.`);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).send('Error: ' + err);
    });
});


// --- Home ---
/**
 * GET request to the homepage.
 * @name getHome
 * @function
 * @memberof module:routes
 * @inner
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get('/', (req, res) => {
    res.send('Welcome to myFlix App')
})


// SERVER LISTENER

/**
 * Starts the server and listens on the specified port.
 * @function
 * @param {number} port - The port number.
 */

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => console.log('Server is running on port ' + port));
