const express = require('express'),
	morgan = require('morgan');

const app = express();

let movies = [
  {
    title: 'A Bronx Tale',
		year: '1993'
  },
  {
    title: 'The Illusionist',
		year: '2006'
  },
  {
    title: 'mid90s',
		year: '2018'
  },
	{
    title: 'Forgetting Sarah Marshall',
		year: '2008'
  },
  {
    title: 'Once Upon A Time In Hollywood',
		year: '2019'
  },
  {
    title: 'Alpha Dog',
		year: '2006'
  },
	{
    title: 'Clerks',
		year: '1994'
  },
  {
    title: 'King Kong',
		year: '2005'
  },
  {
    title: 'As Good as It Gets',
		year: '1997'
  },
	{
    title: 'Rush Hour 2',
		year: '2001'
  },
  {
    title: 'Beverly Hills Ninja',
		year: '1997'
  },

];

// GET requests
app.get('/', (req, res) => {
  res.send('Favorite movies from 1993-2019.');
});

app.use(morgan('common'));

app.use(express.static('public'));

app.get('/movies', (req, res) => {
  res.json(movies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Uh-oh! Something went wrong!');
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
