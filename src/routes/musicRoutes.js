const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

router.get('/add', (req, res) => {
    res.render('addMusic');
});

router.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    const fileStream = fs.createReadStream(file.path);

    const s3 = new AWS.S3();
    const uploadParams = {
        Bucket: 'spotify95', // Remplacez par votre nom de bucket
        Key: file.originalname,
        Body: fileStream
    };

    s3.upload(uploadParams, function(err, data) {
        if (err) {
            return res.status(500).send(err);
        }

        res.send('Fichier uploadé avec succès: ' + data.Location);
    });
});

module.exports = router;
