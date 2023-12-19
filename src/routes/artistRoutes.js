const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const Artist = require('../models/artist');
const Music = require('../models/music');
const Album = require('../models/album');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// router.get('/add', (req, res) => {
//     res.render('addArtist', { albums, musics });
// });


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
        const imageUrl = await uploadToS3(imageFile, 'artistImages');
        
        const albumObject = await Album.findById(albums);
        if (!albumObject) {
            return res.status(400).send(`mudicu non trouvé pour l'ID : ${albums}`);
        }

        const musicObjects = await Music.find({ _id: { $in: musics } });

        const newArtist = new Artist({
            name,
            imageUrl,
            description,
            albums: [albumObject._id],
            music: musicObjects.map(music => music._id)
        });

        await newArtist.save();
        res.send('Artiste ajouté avec succès.');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
