const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const Artist = require('../models/artist');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/adddddddd', (req, res) => {
    res.render('addArtist');
});

router.post('/upload', upload.single('image'), async (req, res) => {
    const { name, description } = req.body;
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

        const newArtist = new Artist({
            name,
            imageUrl,
            description
        });

        await newArtist.save();
        res.send('Artiste ajouté avec succès.');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
