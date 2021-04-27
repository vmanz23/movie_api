const express = require('express');
const app = express();

let topMovies = [
  {
    title: 'A Bronx Tale'

  },
  {
    title: 'The Illusionist'

  },
  {
    title: 'Forgetting Sarah Marshall'

  }
];

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my movie club!');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/books', (req, res) => {
  res.json(topMovies);
});


// listen for requests
app.listen(8080, () =>{
  console.log('Your app is listening on port 8080.');
});
