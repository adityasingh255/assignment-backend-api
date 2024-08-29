const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    serial_number: Number,
    product_name: String,
    input_image_urls: [String],
    output_image_urls: [String],
});

const RequestSchema = new mongoose.Schema({
    request_id: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    products: [ProductSchema],
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);
