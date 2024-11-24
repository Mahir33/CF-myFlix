const mongoose = require('mongoose');

// Genre Schema
const genreSchema = mongoose.Schema({
    Name: { type: String, required: true },
    Description: String
});

// Director Schema
const directorSchema = mongoose.Schema({
    Name: { type: String, required: true },
    Bio: String,
    Birth: Date,
    Death: Date
});

// Movie Schema
let movieSchema = mongoose.Schema({
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Director: { type: mongoose.Schema.Types.ObjectId, ref: 'Director' },
    Genre: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre' },
    Actors: [String],
    Release_year: Number,
    ImageURL: String,
    Featured: Boolean,
});

let userSchema = mongoose.Schema({
    Username: { type: String, required: true },
    Password: { type: String, required: true },
    Email: { type: String, required: true },
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});


let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
let Genre = mongoose.model('Genre', genreSchema);
let Director = mongoose.model('Director', directorSchema);

module.exports = {Movie, User, Genre, Director};