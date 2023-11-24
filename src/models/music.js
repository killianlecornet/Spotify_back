const mongoose = require('mongoose');

// Modèle de données pour une musique
const musicSchema = new mongoose.Schema({
  title: String,
  artist: String,
  album: String,
  year: Number,
  genre: String,
  duration: String,
  filePath: String,
  fileName: String,
});

module.exports = mongoose.model('Music', musicSchema);
