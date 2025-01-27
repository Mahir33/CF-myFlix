const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * User schema definition.
 * @typedef {Object} User
 * @property {string} Username - The username of the user.
 * @property {string} Password - The password of the user.
 * @property {string} Email - The email of the user.
 * @property {Date} Birthday - The birthday of the user.
 * @property {Array<ObjectId>} FavoriteMovies - The list of favorite movies of the user.
 */

const userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

/**
 * Pre-save hook to hash the user's password before saving.
 * @function
 * @memberof User
 * @param {function} next - The next middleware function.
 */
userSchema.pre('save', async function(next) {
  if (this.isModified('Password') || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password, salt);
  }
  next();
});

/**
 * Method to validate the user's password.
 * @function
 * @memberof User
 * @param {string} password - The password to validate.
 * @returns {Promise<boolean>} - True if the password is valid, false otherwise.
 */
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.Password);
};

/**
 * Movie schema definition.
 * @typedef {Object} Movie
 * @property {string} Title - The title of the movie.
 * @property {string} Description - The description of the movie.
 * @property {ObjectId} Genre - The genre of the movie.
 * @property {ObjectId} Director - The director of the movie.
 * @property {Array<string>} Actors - The list of actors in the movie.
 * @property {string} Image_url - The URL of the movie's image.
 * @property {boolean} Featured - Whether the movie is featured.
 */
const movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String
  },
  Director: { type: mongoose.Schema.Types.ObjectId, ref: 'Director', required: true },
  Genre: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre', required: true },
  Actors: [String],
  Image_url: String,
  Featured: Boolean
});

/**
 * Genre schema definition.
 * @typedef {Object} Genre
 * @property {string} Name - The name of the genre.
 * @property {string} Description - The description of the genre.
 */
const genreSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Description: { type: String, required: true }
});

/**
 * Director schema definition.
 * @typedef {Object} Director
 * @property {string} Name - The name of the director.
 * @property {string} Bio - The biography of the director.
 * @property {Date} Birth - The birth date of the director.
 * @property {Date} Death - The death date of the director.
 */
const directorSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Bio: { type: String, required: true },
  Birth: Date,
  Death: Date
});

const User = mongoose.model('User', userSchema);
const Movie = mongoose.model('Movie', movieSchema);
const Genre = mongoose.model('Genre', genreSchema);
const Director = mongoose.model('Director', directorSchema);

module.exports.User = User;
module.exports.Movie = Movie;
module.exports.Genre = Genre;
module.exports.Director = Director;