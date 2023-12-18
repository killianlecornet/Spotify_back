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

router.get('/add', async (req, res) => {
    try {
        const artists = await Artist.find();
        const musics = await Music.find();
        res.render('addAlbum', { artists, musics });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// routes/albumRoutes.js
router.post('/upload', upload.single('image'), async (req, res) => {
    const { title, artist, releaseDate, description, musics } = req.body;
    const imageFile = req.file;

    console.log('Album Upload Request:', req.body);

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
            music: musicObjects.map(music => music._id)
        });

        await newAlbum.save();
        res.send('Album ajouté avec succès.');

    } catch (error) {
        res.status(500).send(error.message);
    }
});


module.exports = router;
