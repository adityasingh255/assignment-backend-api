const axios = require('axios');
const sharp = require('sharp');
const Request = require('../models/Request');
const path = require('path');
const fs = require('fs');

const processImage = async (job) => {
    const { requestId } = job.data;
    const request = await Request.findOne({ request_id: requestId });

    if (!request) {
        throw new Error('Request not found');
    }

    request.status = 'processing';
    await request.save();

    for (const product of request.products) {
        const outputUrls = [];

        for (const inputUrl of product.input_image_urls) {
            const response = await axios.get(inputUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'binary');

            // Compress image
            const outputBuffer = await sharp(imageBuffer).jpeg({ quality: 50 }).toBuffer();

            // Save the compressed image
            const outputFileName = `output-${path.basename(inputUrl)}`;
            const outputPath = path.join(__dirname, '..', 'uploads', outputFileName);
            fs.writeFileSync(outputPath, outputBuffer);

            outputUrls.push(`http://localhost:3000/uploads/${outputFileName}`);
        }

        product.output_image_urls = outputUrls;
    }

    request.status = 'completed';
    await request.save();
};

module.exports = processImage;
