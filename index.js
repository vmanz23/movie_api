const express = require('express'),
morgan = require('morgan');

const app = express();

const cors = require('cors');
app.use(cors());

const { check, validationResult } = require('express-validator');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/movieApiDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const bodyParser = require('body-parser');

app.use(bodyParser.json());

let auth = require('./auth')(app)

const passport = require('passport');
require('./passport');

app.use(morgan('common'));

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.err(err.stack);
  res.status(500).send('Error!');
});



app.get('/', (req, res) => {
  res.send('Welcome to FlixInfo!')
});

//GET request to have a list of ALL movies in the Database
app.get('/movies', (req, res) => {
  Movies.find().then((movies) => {
    res.status(201).json(movies);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});

//GET request to get information about a certain movie by title
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ Title: req.params.Title }).then((movie) => {
    res.status(201).json(movie);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});

//GET request to get information about a specific genre (by name)
app.get('/movies/genres/:Genre', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({'Genre.Name': req.params.Genre}).then((genre) => {
    res.status(201).json(genre.Genre);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});

//GET request to get information about a specific Director (by name)
app.get('/movies/directors/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({'Director.Name': req.params.Name}).then((director) => {
    res.status(201).json(director.Director);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});


//POST request to create a new user
app.post('/users',
[
check('Username', 'Username is required').isLength({min:5}),
check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
check('Password', 'Password is required').not().isEmpty(),
check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
  let errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({Username: req.body.Username}).then((user) => {
    if(user) {
      return res.status(400).send(req.body.Username + ' already exists.');
    } else {
      Users.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }).then((user) => {res.status(201).json(user)}).catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      })
    }
  }).catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});

//PUT request to update an existing user
app.put('/users/:Username', passport.authenticate('jwt', {session: false}),
[
check('Username', 'Username is required').isLength({min:5}),
check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
check('Password', 'Password is required').not().isEmpty(),
check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
  let errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({ Username: req.params.Username},
{ $set: {
  Username: req.body.Username,
  Password: hashedPassword,
  Email: req.body.Email,
  Birthday: req.body.Birthday
  }
},
{ new : true},
(err, updatedUser) => {
  if(err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  } else {
    res.json(updatedUser);
    };
  });
});

//POST request to add a movie (by movieID) to a user's favourite movie list.
app.post('/users/:Username/favourites/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username},
{$push: {FavoriteMovies: req.params.MovieID}},
{new: true},
(err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
      };
    });
  });

//DELETE request to remove a movie (by movieID) from a user's favourite movie list.
app.delete('/users/:Username/favourites/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
 Users.findOneAndUpdate({Username: req.params.Username},
 {$pull: {FavoriteMovies: req.params.MovieID}},
 {new: true},
 (err, updatedUser) => {
   if(err) {
     console.error(err);
     res.status(500).send('Error: ' + err);
   } else {
     res.json(updatedUser);
   };
 });
});

//DELETE request to delete a user (by username)
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndRemove({Username: req.params.Username}).then((user) => {
    if(!user) {
      res.status(400).send(req.params.Username + ' was not found.');
    } else {
      res.status(200).send(req.params.Username + ' was deleted.');
    };
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
    });
  });


//Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port' + port);
})
