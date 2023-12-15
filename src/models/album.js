const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    title: String,
    artist: String,
    releaseDate: Date,
    imageUrl: String, // URL de l'image sur S3
    description: String
});

module.exports = mongoose.model('Album', albumSchema);
