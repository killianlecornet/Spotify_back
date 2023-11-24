const AWS = require('aws-sdk');
const fs = require('fs');

// Configuration AWS
AWS.config.update({
  accessKeyId: 'VOTRE_ACCESS_KEY_ID',
  secretAccessKey: 'VOTRE_SECRET_ACCESS_KEY',
  region: 'VOTRE_REGION_AWS',
});

// Création d'une instance S3
const s3 = new AWS.S3();

// Spécifiez le chemin du fichier que vous souhaitez télécharger
const filePath = 'chemin/vers/votre/fichier.txt';

// Spécifiez le nom de votre bucket S3
const bucketName = 'spotify98';

// Lire le fichier en tant que flux
const fileStream = fs.createReadStream(filePath);

// Paramètres pour l'upload
const uploadParams = {
  Bucket: spotify98,
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