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

router.get('/add', async (req, res) => {
    try {
        const artists = await Artist.find();
        const albums = await Album.find();
        res.render('addMusic', { artists, albums });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post('/upload', upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'album', maxCount: 1 } // Ajout du champ album dans le formulaire
]), async (req, res) => {
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
                Body: fs.createReadStream(file.path)
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
            imageUrl
        });

        await newMusic.save();
        res.send('Fichier audio et image uploadés et enregistrés avec succès.');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
