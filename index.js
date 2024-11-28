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

const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Director;
const Genres = Models.Genre;

// const dbUrl = 'mongodb://127.0.0.1:27017/newMyFlixDB';
const dbAtlasURL = process.env.CONNECTION_URI;
mongoose.connect(dbAtlasURL, { useNewUrlParser: true, useUnifiedTopology: true });

// ---> Middleware <---

// cors
let allowedOrigins = [
  'http://localhost:8080', 
  'http://testsite.com'
];
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
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



app.use(express.static(path.join(__dirname, 'public')));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
    res.status(404).send('Not Found!');
})


// ------------- CRUD ---------------

// ---> CREATE <---

// POST user - register user
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
        .then((user) =>{res.status(201).json(user) })
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

// GET all movies
app.get('/movies', passport.authenticate('jwt', {session:false}), async (req, res) => {
   await Movies.find()
  .then((movies) => {
     res.json(movies);
  })
  .catch((err) => {
    res.status(404).send('Something went wrong');
  });
})

// Get documentation for api
app.get('/documentation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/documentation.html'));
})

// GET a single movie by title
app.get('/movies/:Title', passport.authenticate('jwt', {session:false}), (req, res) => {
  Movies.findOne({"Title": req.params.Title})
  .then(movie => res.status(201).json(movie))
  .catch(err => res.status(404).send('Movie not found'));
});

// GET genre data
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

// GET data about director
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

// GET all users
// app.get('/users', passport.authenticate('jwt', {session:false}), async (req, res) => {
  
//   await Users.find()
//       .then((user) => {
//           res.json(user);
//       })
//       .catch((err) => {
//           console.error(err);
//           res.status(500).send('Error: ' + err);
//       });
// });


// GET user by username
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

// Update username
app.put('/users/:Username', passport.authenticate('jwt', {session:false}), async (req, res) => {
  
    if(req.user.Username !== req.params.Username){
      return res.status(400).send('Permission denied');
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

// POST user - add favorite movie to list of favorite movies
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

// DELETE favorite movie from users list of favorite movies
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

// DELETE user - deregister user from the database

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
app.get('/', (req, res) => {
    res.send('Welcome to myFlix App')
})


// SERVER LISTENER
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => console.log('Server is running on port ' + port));