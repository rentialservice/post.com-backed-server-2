import dotenv from "dotenv";
dotenv.config();
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET,
    },
    region: process.env.AWS_REGION
});

export const putImage = async (imageName,imageCategory,buffer, mimetype) => {
    const putc = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `/${imageCategory}/${imageName}`,
        Body: buffer,
        ContentType: mimetype
    });
    await s3.send(putc);
    const imageURL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageCategory}/${imageName}`;
    return imageURL;
};

export const deleteImage = async (imageUrl) => {
    if (!imageUrl) {
        return; 
    }
    const key=imageUrl.split('.com/')[1];
    // console.log(key);
    const deletec = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    });
    await s3.send(deletec);
};