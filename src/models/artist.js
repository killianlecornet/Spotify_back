const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
    name: String,
    imageUrl: String, // URL de l'image sur S3
    description: String
});

module.exports = mongoose.model('Artist', artistSchema);
