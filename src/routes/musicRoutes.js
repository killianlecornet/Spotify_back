// routes/musicRoutes.js
const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const Music = require('../models/music');
const Artist = require('../models/artist');
const Album = require('../models/album');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/', async (req, res) => {
  try {
    let filter = {};
    const query = req.query.query;

    if (query) {
      // Filtrer les musiques en fonction de la requête de recherche
      filter.title = new RegExp(query, 'i');
    }

    const musics = await Music.find(filter).populate('artist');
    res.render('listMusic', { musics, query });
  } catch (error) {
    res
      .status(500)
      .send('Erreur lors de la récupération des morceaux: ' + error.message);
  }
});

router.get('/add', async (req, res) => {
  try {
    const artists = await Artist.find();
    const albums = await Album.find();
    res.render('addMusic', { artists, albums });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/stats', async (req, res) => {
  try {
    const musicCount = await Music.countDocuments();
    const albumCount = await Album.countDocuments();
    res.render('stats', { musicCount, albumCount });
  } catch (error) {
    res
      .status(500)
      .send(
        'Erreur lors de la récupération des statistiques: ' + error.message,
      );
  }
});

router.post('/delete/:id', async (req, res) => {
  try {
    await Music.findByIdAndDelete(req.params.id);
    res.redirect('/music');
  } catch (error) {
    res
      .status(500)
      .send('Erreur lors de la suppression du morceau: ' + error.message);
  }
});

router.post(
  '/upload',
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'album', maxCount: 1 }, // Ajout du champ album dans le formulaire
  ]),
  async (req, res) => {
    const { title, artist, genre, album } = req.body;
    const audioFile = req.files.file[0];
    const imageFile = req.files.image[0];

    console.log('Music Upload Request:', req.body);

    const s3 = new AWS.S3();

    const uploadToS3 = (file, keyPrefix) => {
      return new Promise((resolve, reject) => {
        const uploadParams = {
          Bucket: 'spotify98',
          Key: `${keyPrefix}/${file.originalname}`,
          Body: fs.createReadStream(file.path),
        };
        s3.upload(uploadParams, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data.Location);
          }
        });
      });
    };

    try {
      const audioUrl = await uploadToS3(audioFile, 'audio');
      const imageUrl = await uploadToS3(imageFile, 'images');

      const newMusic = new Music({
        title,
        artist,
        genre,
        album, // Utilisation de l'ID de l'album
        url: audioUrl,
        imageUrl,
      });

      await newMusic.save();
      res.send('Fichier audio et image uploadés et enregistrés avec succès.');
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
);

router.get('/edit/:id', async (req, res) => {
  try {
    const music = await Music.findById(req.params.id)
      .populate('artist')
      .populate('album');
    const artists = await Artist.find();
    const albums = await Album.find();
    res.render('editMusic', { music, artists, albums });
  } catch (error) {
    res
      .status(500)
      .send('Erreur lors de la récupération du morceau: ' + error.message);
  }
});

// Route pour gérer la mise à jour d'un morceau de musique
router.post(
  '/update/:id',
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  async (req, res) => {
    const { title, artist, genre, album } = req.body;
    const audioFile = req.files.file ? req.files.file[0] : null;
    const imageFile = req.files.image ? req.files.image[0] : null;

    try {
      // Logique pour gérer le fichier audio et l'image si fournies
      let audioUrl, imageUrl;
      if (audioFile) {
        audioUrl = await uploadToS3(audioFile, 'audio');
      }
      if (imageFile) {
        imageUrl = await uploadToS3(imageFile, 'images');
      }

      const updateData = {
        title,
        artist,
        genre,
        album,
        ...(audioUrl && { url: audioUrl }),
        ...(imageUrl && { imageUrl: imageUrl }),
      };

      await Music.findByIdAndUpdate(req.params.id, updateData);
      res.redirect('/music');
    } catch (error) {
      res
        .status(500)
        .send('Erreur lors de la mise à jour du morceau: ' + error.message);
    }
  },
);

module.exports = router;
