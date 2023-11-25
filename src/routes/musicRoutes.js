const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const Music = require('../models/Music'); // Assurez-vous que le chemin est correct

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/add', (req, res) => {
    res.render('addMusic');
});

router.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file;
    const fileStream = fs.createReadStream(file.path);

    const s3 = new AWS.S3();
    const uploadParams = {
        Bucket: 'spotify95', // Remplacez par votre nom de bucket
        Key: file.originalname,
        Body: fileStream
    };

    s3.upload(uploadParams, async (err, data) => {
        if (err) {
            return res.status(500).send(err);
        }

        try {
            const newMusic = new Music({
                title: req.file.originalname, // Vous pouvez ajuster ces champs selon vos besoins
                artist: 'Artiste Inconnu', // Par exemple, en les extrayant de 'req.body' si nécessaire
                url: data.Location
            });

            await newMusic.save();
            res.send('Fichier uploadé et enregistré avec succès: ' + data.Location);
        } catch (error) {
            res.status(500).send(error.message);
        }
    });
});

module.exports = router;
