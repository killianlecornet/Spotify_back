const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const Artist = require('../models/artist');
const Music = require('../models/music');
const Album = require('../models/album');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/', async (req, res) => {
  try {
    let filter = {};
    const query = req.query.query;

    if (query) {
      // Filtrer les artistes en fonction de la requête de recherche
      filter.name = new RegExp(query, 'i');
    }

    const artists = await Artist.find(filter);
    res.render('listArtist', { artists, query });
  } catch (error) {
    res
      .status(500)
      .send('Erreur lors de la récupération des artistes: ' + error.message);
  }
});

router.get('/add', async (req, res) => {
  try {
      const albums = await Album.find();
      const musics = await Music.find();
      res.render('addArtist', { albums, musics });
  } catch (error) {
      res.status(500).send(error.message);
  }
});


router.post('/upload', upload.single('image'), async (req, res) => {
  const { name, description, albums, musics } = req.body;
  const imageFile = req.file;

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
    const imageUrl = await uploadToS3(imageFile, 'artistImages');

    const albumObject = await Album.findById(albums);
    if (!albumObject) {
      return res.status(400).send(`mudicu non trouvé pour l'ID : ${albums}`);
    }

    const musicObjects = await Music.findById(musics);

    const newArtist = new Artist({
      name,
      imageUrl,
      description,
      albums: [albumObject._id],
      music: musicObjects.map((music) => music._id),
    });

    await newArtist.save();
    res.send('Artiste ajouté avec succès.');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post('/delete/:id', async (req, res) => {
  try {
    await Artist.findByIdAndDelete(req.params.id);
    res.redirect('/artist');
  } catch (error) {
    res
      .status(500)
      .send("Erreur lors de la suppression de l'artiste: " + error.message);
  }
});

router.get('/edit/:id', async (req, res) => {
  try {
      const artist = await Artist.findById(req.params.id);
      const albums = await Album.find();
      const musics = await Music.find();
      res.render('editArtist', { artist, albums, musics });
  } catch (error) {
      res.status(500).send("Erreur lors de la récupération de l'artiste: " + error.message);
  }
});


router.post('/update/:id', upload.single('image'), async (req, res) => {
  const artistId = req.params.id;
  const { name, description, albums, musics, existingAlbums, existingMusics } = req.body;

  try {
    const updateData = {
      name,
      description,
      // Ajoutez la logique pour gérer l'image si elle est fournie
    };

    await Artist.findByIdAndUpdate(req.params.id, updateData);
    res.redirect('/artist');
  } catch (error) {
    res
      .status(500)
      .send("Erreur lors de la mise à jour de l'artiste: " + error.message);
  }
});

module.exports = router;
