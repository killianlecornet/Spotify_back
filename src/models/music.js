const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
    title: String,
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist'
    },
    genre: String,
    url: String, // URL du fichier audio sur S3
    imageUrl: String // URL de l'image sur S3
});

module.exports = mongoose.model('Music', musicSchema);
