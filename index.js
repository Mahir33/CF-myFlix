const bodyParser = require('body-parser');

const express = require('express'), 
morgan = require('morgan'), 
fs = require('fs'), 
path = require('path'), 
app = express(),
mongoose = require('mongoose'),
Models = require('./models.js'),
auth = require('./auth')(app),
passport = require('passport');

require('./passport.js')

const Movies = Models.Movie,
Users = Models.User,
Directors = Models.Director,
Genres = Models.Genre;

const dbUrl = 'mongodb://127.0.0.1:27017/newMyFlixDB'

mongoose.connect(dbUrl);

// Internal movie database
// const movies = [
//   {
//     name: "The Shawshank Redemption",
//     description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
//     genre: "Drama",
//     director: { 
//       name: "Frank Darabont",
//       birthYear: 1959,
//       deathYear: null,
//       bio: "Frank Darabont is a French-American director, screenwriter, and producer known for his adaptations of Stephen King's works."
//     },
//     imageUrl: "https://example.com/shawshank.jpg"
//   },
//   {
//     name: "The Godfather",
//     description: "The aging patriarch of an organized crime dynasty transfers control of his empire to his reluctant son.",
//     genre: "Crime, Drama",
//     director: { 
//       name: "Francis Ford Coppola",
//       birthYear: 1939,
//       deathYear: null,
//       bio: "Francis Ford Coppola is an American director, producer, and screenwriter, famous for directing The Godfather trilogy."
//     },
//     imageUrl: "https://example.com/godfather.jpg"
//   },
//   {
//     name: "The Dark Knight",
//     description: "When the Joker emerges from his mysterious past, he wreaks havoc and chaos on Gotham, forcing Batman to face one of his greatest threats.",
//     genre: "Action, Crime, Drama",
//     director: { 
//       name: "Christopher Nolan",
//       birthYear: 1970,
//       deathYear: null,
//       bio: "Christopher Nolan is an acclaimed British-American filmmaker known for his complex, high-concept films."
//     },
//     imageUrl: "https://example.com/darkknight.jpg"
//   },
//   {
//     name: "Pulp Fiction",
//     description: "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
//     genre: "Crime, Drama",
//     director: { 
//       name: "Quentin Tarantino",
//       birthYear: 1963,
//       deathYear: null,
//       bio: "Quentin Tarantino is an American filmmaker celebrated for his stylized, nonlinear storytelling and genre-blending films."
//     },
//     imageUrl: "https://example.com/pulpfiction.jpg"
//   },
//   {
//     name: "Forrest Gump",
//     description: "The story of Forrest Gump, a man with low intelligence who inadvertently influences historical events while pursuing his true love, Jenny.",
//     genre: "Drama, Romance",
//     director: { 
//       name: "Robert Zemeckis",
//       birthYear: 1951,
//       deathYear: null,
//       bio: "Robert Zemeckis is an American director and producer, known for his innovative use of visual effects in storytelling."
//     },
//     imageUrl: "https://example.com/forrestgump.jpg"
//   },
//   {
//     name: "Inception",
//     description: "A thief who enters the dreams of others to steal secrets is given a seemingly impossible task: implant an idea in someone's mind.",
//     genre: "Action, Adventure, Sci-Fi",
//     director: { 
//       name: "Christopher Nolan",
//       birthYear: 1970,
//       deathYear: null,
//       bio: "Christopher Nolan is an acclaimed British-American filmmaker known for his complex, high-concept films."
//     },
//     imageUrl: "https://example.com/inception.jpg"
//   },
//   {
//     name: "The Matrix",
//     description: "A hacker discovers that the world around him is a simulated reality and joins a rebellion to free humanity from its enslavers.",
//     genre: "Action, Sci-Fi",
//     director: { 
//       name: "The Wachowskis",
//       birthYear: 1965,
//       deathYear: null,
//       bio: "Lana and Lilly Wachowski are American filmmakers and writers known for their work on The Matrix series."
//     },
//     imageUrl: "https://example.com/matrix.jpg"
//   },
//   {
//     name: "Fight Club",
//     description: "An insomniac office worker and a soap salesman form an underground fight club that evolves into something much bigger.",
//     genre: "Drama",
//     director: { 
//       name: "David Fincher",
//       birthYear: 1962,
//       deathYear: null,
//       bio: "David Fincher is an American director known for his dark and stylistic thrillers, including Fight Club and Seven."
//     },
//     imageUrl: "https://example.com/fightclub.jpg"
//   },
//   {
//     name: "The Lord of the Rings: The Return of the King",
//     description: "The final battle for Middle-earth begins as Frodo and Sam, guided by Gollum, reach Mount Doom to destroy the One Ring.",
//     genre: "Action, Adventure, Fantasy",
//     director: { 
//       name: "Peter Jackson",
//       birthYear: 1961,
//       deathYear: null,
//       bio: "Peter Jackson is a New Zealand filmmaker best known for his adaptation of J.R.R. Tolkien's The Lord of the Rings."
//     },
//     imageUrl: "https://example.com/lotr-returnoftheking.jpg"
//   },
//   {
//     name: "Schindler's List",
//     description: "In German-occupied Poland during World War II, businessman Oskar Schindler saves his Jewish employees from the Holocaust.",
//     genre: "Biography, Drama, History",
//     director: { 
//       name: "Steven Spielberg",
//       birthYear: 1946,
//       deathYear: null,
//       bio: "Steven Spielberg is a renowned American director, producer, and screenwriter known for films across genres."
//     },
//     imageUrl: "https://example.com/schindlerslist.jpg"
//   }
// ];

const users = []

// Middleware


app.use(bodyParser.json());
app.use(morgan('common'));
app.use(bodyParser.urlencoded({ extended: true }));




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
      return res.status(400).send(req.body.Username + 'already exists');
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
          Birthday: req.body.Birthday
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
app.listen(8080, () => console.log('Server is running on port 8080'));