// albumRoutes.js
const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const Album = require('../models/album');
const Artist = require('../models/artist');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/add', async (req, res) => {
    try {
        const artists = await Artist.find();
        res.render('addAlbum', { artists });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post('/upload', upload.single('image'), async (req, res) => {
    const { title, artist, releaseDate, description } = req.body;
    const imageFile = req.file;

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
        const imageUrl = await uploadToS3(imageFile, 'albumImages');

        // Récupérez l'ID de l'artiste à partir du nom de l'artiste
        const artistObject = await Artist.findById(artist);
        if (!artistObject) {
            return res.status(400).send(`Artiste non trouvé pour l'ID : ${artist}`);
        }

        const newAlbum = new Album({
            title,
            artist: artistObject._id, // Utilisez l'ID de l'artiste
            releaseDate,
            imageUrl,
            description
        });

        await newAlbum.save();
        res.send('Album ajouté avec succès.');


    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
