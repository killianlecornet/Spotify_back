const express = require('express');
const bodyParser = require('body-parser');
const musicRoutes = require('./src/routes/musicRoutes');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.ACCES_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCES_KEY_ID,
  region: 'us-east-1'
});

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/music', musicRoutes);

app.get('/', (req, res) => {
    res.send('Bienvenue sur notre application Spotify-like!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
