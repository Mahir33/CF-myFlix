const bodyParser = require('body-parser');

const express = require('express'), 
morgan = require('morgan'), 
fs = require('fs'), 
path = require('path'), 
app = express();

// Internal movie database
const movies = [
  {
    name: "The Shawshank Redemption",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    genre: "Drama",
    director: { 
      name: "Frank Darabont",
      birthYear: 1959,
      deathYear: null,
      bio: "Frank Darabont is a French-American director, screenwriter, and producer known for his adaptations of Stephen King's works."
    },
    imageUrl: "https://example.com/shawshank.jpg"
  },
  {
    name: "The Godfather",
    description: "The aging patriarch of an organized crime dynasty transfers control of his empire to his reluctant son.",
    genre: "Crime, Drama",
    director: { 
      name: "Francis Ford Coppola",
      birthYear: 1939,
      deathYear: null,
      bio: "Francis Ford Coppola is an American director, producer, and screenwriter, famous for directing The Godfather trilogy."
    },
    imageUrl: "https://example.com/godfather.jpg"
  },
  {
    name: "The Dark Knight",
    description: "When the Joker emerges from his mysterious past, he wreaks havoc and chaos on Gotham, forcing Batman to face one of his greatest threats.",
    genre: "Action, Crime, Drama",
    director: { 
      name: "Christopher Nolan",
      birthYear: 1970,
      deathYear: null,
      bio: "Christopher Nolan is an acclaimed British-American filmmaker known for his complex, high-concept films."
    },
    imageUrl: "https://example.com/darkknight.jpg"
  },
  {
    name: "Pulp Fiction",
    description: "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    genre: "Crime, Drama",
    director: { 
      name: "Quentin Tarantino",
      birthYear: 1963,
      deathYear: null,
      bio: "Quentin Tarantino is an American filmmaker celebrated for his stylized, nonlinear storytelling and genre-blending films."
    },
    imageUrl: "https://example.com/pulpfiction.jpg"
  },
  {
    name: "Forrest Gump",
    description: "The story of Forrest Gump, a man with low intelligence who inadvertently influences historical events while pursuing his true love, Jenny.",
    genre: "Drama, Romance",
    director: { 
      name: "Robert Zemeckis",
      birthYear: 1951,
      deathYear: null,
      bio: "Robert Zemeckis is an American director and producer, known for his innovative use of visual effects in storytelling."
    },
    imageUrl: "https://example.com/forrestgump.jpg"
  },
  {
    name: "Inception",
    description: "A thief who enters the dreams of others to steal secrets is given a seemingly impossible task: implant an idea in someone's mind.",
    genre: "Action, Adventure, Sci-Fi",
    director: { 
      name: "Christopher Nolan",
      birthYear: 1970,
      deathYear: null,
      bio: "Christopher Nolan is an acclaimed British-American filmmaker known for his complex, high-concept films."
    },
    imageUrl: "https://example.com/inception.jpg"
  },
  {
    name: "The Matrix",
    description: "A hacker discovers that the world around him is a simulated reality and joins a rebellion to free humanity from its enslavers.",
    genre: "Action, Sci-Fi",
    director: { 
      name: "The Wachowskis",
      birthYear: 1965,
      deathYear: null,
      bio: "Lana and Lilly Wachowski are American filmmakers and writers known for their work on The Matrix series."
    },
    imageUrl: "https://example.com/matrix.jpg"
  },
  {
    name: "Fight Club",
    description: "An insomniac office worker and a soap salesman form an underground fight club that evolves into something much bigger.",
    genre: "Drama",
    director: { 
      name: "David Fincher",
      birthYear: 1962,
      deathYear: null,
      bio: "David Fincher is an American director known for his dark and stylistic thrillers, including Fight Club and Seven."
    },
    imageUrl: "https://example.com/fightclub.jpg"
  },
  {
    name: "The Lord of the Rings: The Return of the King",
    description: "The final battle for Middle-earth begins as Frodo and Sam, guided by Gollum, reach Mount Doom to destroy the One Ring.",
    genre: "Action, Adventure, Fantasy",
    director: { 
      name: "Peter Jackson",
      birthYear: 1961,
      deathYear: null,
      bio: "Peter Jackson is a New Zealand filmmaker best known for his adaptation of J.R.R. Tolkien's The Lord of the Rings."
    },
    imageUrl: "https://example.com/lotr-returnoftheking.jpg"
  },
  {
    name: "Schindler's List",
    description: "In German-occupied Poland during World War II, businessman Oskar Schindler saves his Jewish employees from the Holocaust.",
    genre: "Biography, Drama, History",
    director: { 
      name: "Steven Spielberg",
      birthYear: 1946,
      deathYear: null,
      bio: "Steven Spielberg is a renowned American director, producer, and screenwriter known for films across genres."
    },
    imageUrl: "https://example.com/schindlerslist.jpg"
  }
];

const users = []

app.use(bodyParser.json());
app.use(morgan('common'));

app.use(express.static(path.join(__dirname, 'public')));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
    res.status(404).send('Not Found!');
})
  
// GET all movies
app.get('/movies', (req, res) => {
    res.json(movies);
})

// Get documentation for api
app.get('/documentation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/documentation.html'));
})

// GET a single movie by name
app.get('/movies/:name', (req, res) => {
  const movie = movies.find(m => m.name.toLowerCase() === req.params.name.toLowerCase());
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).send('Movie not found');
  }
});

// GET movies by genre
app.get('/genres/:name', (req, res) => {
  const genre = movies.filter(m => m.genre.toLowerCase() === req.params.name.toLowerCase());
  if (genre.length > 0) {
    res.json(genre);
  } else {
    res.status(404).send('No movies found for this genre');
  }
});

// GET movies by director name
app.get('/directors/:name', (req, res) => {
  const directorMovie = movies.filter(m => m.director.name.toLowerCase() === req.params.name.toLowerCase());
  const directorData = directorMovie[0].director;
  
  if (directorMovie.length > 0) {
    res.json(directorData);
  } else {
    res.status(404).send('No movies found by this director');
  }
});

// POST user - register user
app.post('/users/register', (req, res) => {
  const { username, password, email } = req.body;
  
  
  if (!username ||!password || !email) {
    return res.status(400).send('Username and password are required');
  }


  res.status(200).send('User registered successfully');
});

// PUT user - update username
app.put('/users/:username', (req, res) => {
  const { username } = req.body;

  if (!username ) {
    return res.status(400).send('Username and password are required');
  }

  res.status(200).send('Username successfully changed to ' + username);
});

// POST user - add favorite movie to list of favorite movies
app.post('/users/:username/favorites', (req, res) => {
  res.status(200).send('Favorite movie added successfully');
});

// DELETE favorite movie from users list of favorite movies
app.delete('/users/:username/favorites/:movieTitle', (req, res) => {
  const { username, movieTitle } = req.params;
  if (!username || !movieTitle ) {
    return res.status(400).send('Username and movie title are required');
  }

  res.status(200).send('Favorite movie removed successfully');
});

// DELETE user - remove user from the database

app.delete('/users/:username', (req, res) => {
  const { username } = req.params;
  if (!username ) {
    return res.status(400).send('Username is required');
  }

  res.status(200).send('User deleted successfully');
})

// Home
app.get('/', (req, res) => {
    res.send('Welcome to myFlix App')
})


// Server setup
app.listen(8080, () => console.log('Server is running on port 8080'));