const express = require('express');
const multer = require('multer');
const Music = require('../models/music');
const router = express.Router();
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'eu-north-1',
});

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'spotify92',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    },
  }),
});

router.post('/music', upload.single('file'), async (req, res) => {
  try {
    const newMusic = new Music({
      title: req.body.title,
      artist: req.body.artist,
      album: req.body.album,
      year: req.body.year,
      genre: req.body.genre,
      duration: req.body.duration,
      filePath: req.file.location,
      fileName: req.file.key,
    });

    await newMusic.save();
    res.redirect('/add-music');
  } catch (error) {
    res.status(500).send({ message: "Erreur lors de l'ajout de la musique", error: error });
  }
});

router.get('/musics', async (req, res) => {
  try {
    const musics = await Music.find({});
    res.status(200).send(musics);
  } catch (error) {
    res.status(500).send({ message: "Erreur lors de la récupération des musiques", error: error });
  }
});

router.get('/add-music', (req, res) => {
  res.render('addMusic');
});

module.exports = router;
