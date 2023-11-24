const express = require('express');
const mongoose = require('mongoose');
const musicRoutes = require('./src/routes/musicRoutes');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const mongoURI = "mongodb+srv://Spotify:Test123@cluster0.rkz3hy4.mongodb.net/"; // Remplacez par votre URI de connexion
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use(musicRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
