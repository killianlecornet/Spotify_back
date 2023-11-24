const dotenv = require('dotenv');
dotenv.config();
const AWS = require('aws-sdk');
const fs = require('fs');

// Configuration AWS
AWS.config.update({
  accessKeyId: process.env.ACCES_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCES_KEY_ID,
  region: 'eu-north-1',
});

// Création d'une instance S3
const s3 = new AWS.S3();

// Spécifiez le chemin du fichier que vous souhaitez télécharger
const filePath = 'C:/Users/matth/Downloads/in-the-forest-2-21402.mp3';

// Spécifiez le nom de votre bucket S3
const bucketName = 'spotify98';

// Lire le fichier en tant que flux
const fileStream = fs.createReadStream(filePath);

// Paramètres pour l'upload
const uploadParams = {
  Bucket: bucketName,
  Key: 'nom-du-fichier-sur-s3.txt', // Nom du fichier sur S3
  Body: fileStream,
};

// Upload du fichier sur S3
s3.upload(uploadParams, (err, data) => {
  if (err) {
    console.error("Erreur lors de l'upload :", err);
  } else {
    console.log('Fichier uploadé avec succès. URL S3 :', data.Location);
  }
});