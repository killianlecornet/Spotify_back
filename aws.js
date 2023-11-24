//veiller à remplacer le nom du bucket 

const AWS = require('aws-sdk');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
// require('dotenv').config();

AWS.config.update({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: 'eu-north-1',
});

const s3 = new AWS.S3();

const uploadAWSMiddleware = (req, res) => {
    // console.log(process.env.accessKeyId)
    // console.log(process.env.secretAccessKey)

    const { title } = req.body; // Assuming title is a unique identifier for the file
    const fileName = "totre";

    const uploadParams = {
        Bucket: 'spotify92',
        Key: "fileName",
        Body: fs.createReadStream('C:/Users/killi/Downloads/in-the-forest-2-21402.mp3'),

    };

    // console.log('uploadParams', uploadParams)²

    s3.upload(uploadParams, (err, data) => {
        if (err) {
            console.error('Error uploading to S3:', err);
            res.status(500).json({ message: 'Error uploading to S3' });
        }
        console.log(accessKeyId);
    });
};

module.exports = uploadAWSMiddleware;