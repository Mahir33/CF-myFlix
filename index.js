const express = require('express'), 
morgan = require('morgan'), 
fs = require('fs'), 
path = require('path'), 
app = express();

const bestFantasyMovies = [
    {
      title: "The Lord of the Rings: The Fellowship of the Ring",
      year: 2001,
      rating: 8.8,
      director: "Peter Jackson",
      summary: "A young hobbit, Frodo, is entrusted with an ancient ring that he must destroy to save Middle-earth from the Dark Lord Sauron."
    },
    {
      title: "Harry Potter and the Sorcerer's Stone",
      year: 2001,
      rating: 7.6,
      director: "Chris Columbus",
      summary: "Harry Potter, a young boy, discovers he's a wizard and enrolls in Hogwarts School of Witchcraft and Wizardry, where he learns about his magical heritage and faces challenges beyond his imagination."
    },
    {
      title: "The Chronicles of Narnia: The Lion, the Witch and the Wardrobe",
      year: 2005,
      rating: 6.9,
      director: "Andrew Adamson",
      summary: "Four siblings enter the magical land of Narnia through a wardrobe, where they must unite with Aslan the lion to defeat the White Witch and restore peace."
    },
    {
      title: "Pan's Labyrinth",
      year: 2006,
      rating: 8.2,
      director: "Guillermo del Toro",
      summary: "In post-Civil War Spain, young Ofelia discovers a mystical labyrinth and meets magical creatures that test her courage and will."
    },
    {
      title: "The Princess Bride",
      year: 1987,
      rating: 8.1,
      director: "Rob Reiner",
      summary: "A young woman named Buttercup is kidnapped and held against her will in order to marry an evil prince, and her true love Westley embarks on an adventure to rescue her."
    },
    {
      title: "Spirited Away",
      year: 2001,
      rating: 8.6,
      director: "Hayao Miyazaki",
      summary: "A young girl named Chihiro becomes trapped in a mysterious spirit world and must find a way to save her parents and escape."
    },
    {
      title: "The Dark Crystal",
      year: 1982,
      rating: 7.2,
      director: "Jim Henson, Frank Oz",
      summary: "In a world ruled by the cruel Skeksis, a young hero named Jen must find the missing shard of a powerful crystal to restore balance to his world."
    },
    {
      title: "Howl's Moving Castle",
      year: 2004,
      rating: 8.2,
      director: "Hayao Miyazaki",
      summary: "Young Sophie is cursed to look like an old woman by a spiteful witch and seeks refuge in the magical castle of a mysterious wizard named Howl."
    },
    {
      title: "Stardust",
      year: 2007,
      rating: 7.6,
      director: "Matthew Vaughn",
      summary: "In a quest to win his true love, a young man named Tristan ventures into a magical realm to retrieve a fallen star, only to discover it’s a beautiful woman being pursued by dark forces."
    },
    {
      title: "The Wizard of Oz",
      year: 1939,
      rating: 8.1,
      director: "Victor Fleming",
      summary: "After a tornado transports her to the magical land of Oz, young Dorothy embarks on a journey to find her way home, making friends and facing dangers along the way."
    }
  ];

app.use(morgan('common'));

app.use(express.static(path.join(__dirname, 'public')));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
    res.status(404).send('Not Found!');
})
  
app.get('/movies', (req, res) => {
    res.json(bestFantasyMovies);
})

app.get('/documentation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/documentation.html'));
})

app.get('/', (req, res) => {
    res.send('Welcome to myFlix App')
})

app.listen(8080, () => console.log('Server is running on port 8080'));