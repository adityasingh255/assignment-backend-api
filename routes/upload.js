const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const Request = require('../models/Request');
const queue = require('../queue');

const router = express.Router();

// File Upload Settings
const upload = multer({ dest: 'uploads/' });

// Upload API
router.post('/upload', upload.single('csv_file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'CSV file is required' });
    }

    const requestId = uuidv4();
    const products = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
            const { 'S. No.': serialNumber, 'Product Name': productName, 'Input Image Urls': inputImageUrls,'Output Image Urls': outputImageUrls} = row;
            products.push({
                serial_number: serialNumber,
                product_name: productName,
                input_image_urls: inputImageUrls.split(',').map(url => url.trim()), // Split input URLs by commas
                output_image_urls: outputImageUrls.split(',').map(url => url.trim()),
            });
        })
        .on('end', async () => {
            const newRequest = new Request({ request_id: requestId, products });
            await newRequest.save();

            // Add job to queue for image processing
            queue.add({ requestId });

            res.json({ request_id: requestId });
        })
        .on('error', (error) => {
            console.error('Error processing CSV:', error);
            res.status(500).json({ error: 'Error processing CSV file' });
        });
});

// Status API to check the status of a request
router.get('/status/:requestId', async (req, res) => {
    const { requestId } = req.params;

    try {
        // Find the request by requestId
        const request = await Request.findOne({ request_id: requestId });

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        res.json({
            request_id: request.request_id,
            status: request.status,
            products: request.products
        });
    } catch (error) {
        console.error('Error fetching status:', error);
        res.status(500).json({ error: 'Error fetching status' });
    }
});

// Get all requests API
router.get('/requests', async (req, res) => {
    try {
        // Fetch all requests from the database
        const requests = await Request.find({}, 'request_id status').lean();

        res.json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: 'Error fetching requests' });
    }
});

module.exports = router;
