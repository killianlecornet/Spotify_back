const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
    title: String,
    artist: String,
    url: String // Champ pour l'URL de l'objet
});

module.exports = mongoose.model('Music', musicSchema);
