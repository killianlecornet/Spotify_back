// routes/albumRoutes.js
const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const Album = require('../models/album');
const Artist = require('../models/artist');
const Music = require('../models/music');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/', async (req, res) => {
  try {
    let filter = {};
    const query = req.query.query;

    if (query) {
      // Filtrer les albums en fonction de la requête de recherche
      filter.title = new RegExp(query, 'i');
    }

    const albums = await Album.find(filter)
      .populate('artist')
      .populate('music');
    res.render('listAlbum', { albums, query });
  } catch (error) {
    res
      .status(500)
      .send('Erreur lors de la récupération des albums: ' + error.message);
  }
});

router.get('/add', async (req, res) => {
  try {
    const artists = await Artist.find();
    const musics = await Music.find();
    res.render('addAlbum', { artists, musics });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post('/upload', upload.single('image'), async (req, res) => {
  const { title, artist, releaseDate, description, musics } = req.body;
  const imageFile = req.file;

  const s3 = new AWS.S3();

  const uploadToS3 = (file, keyPrefix) => {
    return new Promise((resolve, reject) => {
      const uploadParams = {
        Bucket: 'spotify95',
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
    const imageUrl = await uploadToS3(imageFile, 'albumImages');

    const artistObject = await Artist.findById(artist);
    if (!artistObject) {
      return res.status(400).send(`Artiste non trouvé pour l'ID : ${artist}`);
    }

    // Modification ici pour récupérer correctement les informations sur plusieurs musiques
    const musicObjects = await Music.find({ _id: { $in: musics } });

    const newAlbum = new Album({
      title,
      artist: artistObject._id,
      releaseDate,
      imageUrl,
      description,
      music: musicObjects.map((music) => music._id),
    });

    await newAlbum.save();
    res.send('Album ajouté avec succès.');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post('/delete/:id', async (req, res) => {
  try {
    await Album.findByIdAndDelete(req.params.id);
    res.redirect('/album');
  } catch (error) {
    res
      .status(500)
      .send("Erreur lors de la suppression de l'album: " + error.message);
  }
});

router.get('/edit/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate('artist')
      .populate('music');
    const artists = await Artist.find();
    const musics = await Music.find();
    res.render('editAlbum', { album, artists, musics });
  } catch (error) {
    res
      .status(500)
      .send("Erreur lors de la récupération de l'album: " + error.message);
  }
});

// Route pour gérer la mise à jour d'un album
router.post('/update/:id', upload.single('image'), async (req, res) => {
  const { title, artist, releaseDate, description, music } = req.body;

  try {
    const updateData = {
      title,
      artist,
      releaseDate: new Date(releaseDate),
      description,
      // Assurez-vous que 'music' est traité correctement en tant que tableau
      music: Array.isArray(music) ? music : [music],
    };

    // Gérez ici l'upload de l'image si nécessaire

    await Album.findByIdAndUpdate(req.params.id, updateData);
    res.redirect('/album');
  } catch (error) {
    res
      .status(500)
      .send("Erreur lors de la mise à jour de l'album: " + error.message);
  }
});

module.exports = router;
