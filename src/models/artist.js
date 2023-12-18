// artist.js (ou le fichier où vous avez défini le modèle)
const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
    name: String,
    imageUrl: String,
    description: String,
    albums: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album'
    }],
    musics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Music'
    }]
});

module.exports = mongoose.model('Artist', artistSchema);
