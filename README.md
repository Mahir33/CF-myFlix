# myFlix API

This repository contains the **myFlix API**, a RESTful backend application for managing movies, users, and favorite movie lists. It serves data about movies, directors, and genres, enabling users to interact with this data securely.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Endpoints](#endpoints)
5. [Prerequisites](#prerequisites)
6. [Setup and Installation](#setup-and-installation)
7. [Usage](#usage)
8. [Live API](#live-api)
9. [Dependencies](#dependencies)
10. [License](#license)

---

## Project Overview
The Movie API provides a server-side application for a movie web application. It allows CRUD operations (Create, Read, Update, Delete) for movies and user information.

The API delivers data about movies, directors, and genres, while enabling users to register, log in, and manage their list of favorite movies.

---

## Features
- User registration and authentication.
- Retrieve information about movies, genres, and directors.
- Add or remove movies from a user's list of favorites.
- Update user information.
- Delete user accounts.

---

## Technologies Used
- **Node.js** - JavaScript runtime environment.
- **Express** - Web framework for building APIs.
- **MongoDB** - NoSQL database for storing data.
- **Mongoose** - ODM for MongoDB.
- **Passport** - Middleware for authentication.
- **JWT** - JSON Web Tokens for secure access.
- **CORS** - Cross-Origin Resource Sharing.
- **Bcrypt** - Password hashing for security.

---

## Endpoints
Here is a summary of available API endpoints:

### Movies
| Request        | Endpoint                  | Description                   |
|----------------|---------------------------|-------------------------------|
| **GET**       | `/movies`                 | Returns all movies.           |
| **GET**       | `/movies/:Title`          | Returns data about a movie.   |
| **GET**       | `/genres/:Name`           | Returns data about a genre.   |
| **GET**       | `/directors/:Name`        | Returns data about a director.|

### Users
| Request        | Endpoint                  | Description                                |
|----------------|---------------------------|--------------------------------------------|
| **POST**      | `/users`                  | Register a new user.                       |
| **GET**       | `/users/:Username`        | Retrieve user data.                        |
| **PUT**       | `/users/:Username`        | Update user information.                   |
| **POST**      | `/users/:Username/favorites` | Add a movie to favorites.          |
| **DELETE**    | `/users/:Username/favorites/:MovieID` | Remove a movie from favorites.    |
| **DELETE**    | `/users/:Username`        | Deregister a user account.                 |

### Authentication
| Request        | Endpoint                  | Description                   |
|----------------|---------------------------|-------------------------------|
| **POST**      | `/login`                  | Authenticate user credentials and return a JWT. |

---

## Prerequisites
Ensure the following tools are installed on your system:
- Node.js (v14+)
- MongoDB (running locally or via cloud provider)
- Postman or similar API testing tool (optional).

---

## Setup and Installation
Follow these steps to set up and run the API locally:

1. **Clone the repository**:
   ```bash
   git clone git@github.com:Mahir33/CF-myFlix.git
   cd CF-myFlix
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure MongoDB**:
   - Set up a MongoDB database locally or on a cloud provider (e.g., MongoDB Atlas).
   - Update the MongoDB connection URI in the project file (e.g., `config.js` or `.env` if applicable).

4. **Run the server**:
   ```bash
   npm start
   ```
   By default, the server will run on `http://localhost:8080`.

5. **Test API**:
   Use tools like **Postman** or **cURL** to test the endpoints.

---

## Usage
Once the API is running, you can interact with the endpoints for user management, movie data, and favorites lists. Refer to the [Endpoints](#endpoints) section for details.

Example Request using **cURL**:
```bash
curl http://localhost:8080/movies
```

---

## Live API
The API is hosted on Heroku and can be accessed at:

[https://myflix-api-mahir-941afb3e93ba.herokuapp.com/](https://myflix-api-mahir-941afb3e93ba.herokuapp.com/)

Use this base URL to interact with the endpoints described above.

---

## Dependencies
Some of the main dependencies used include:
- `express`
- `mongoose`
- `passport`
- `jsonwebtoken`
- `bcrypt`
- `cors`

Refer to the `package.json` file for a full list of dependencies.

---

## License
This project is licensed under the **MIT License**.

---

### Author
**Mahir33**  
[GitHub Profile](https://github.com/mahir33)