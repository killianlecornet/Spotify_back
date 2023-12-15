const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const musicRoutes = require('./src/routes/musicRoutes');
const artistRoutes = require('./src/routes/artistRoutes');
const albumRoutes = require('./src/routes/albumRoutes');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.ACCES_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCES_KEY_ID,
  region: 'eu-north-1'
});

// Remplacez l'URL par votre chaîne de connexion MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connexion à MongoDB réussie');
}).catch(err => {
  console.error('Erreur de connexion à MongoDB:', err);
});

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/music', musicRoutes);
app.use('/artist', artistRoutes);
app.use('/album', albumRoutes);

app.get('/', (req, res) => {
    res.send('Bienvenue sur notre application Spotify-like!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
