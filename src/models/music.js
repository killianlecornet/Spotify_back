const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
    title: String,
    artist: String,
    genre: String, // Nouveau champ pour le genre
    url: String
});

module.exports = mongoose.model('Music', musicSchema);
