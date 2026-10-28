const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    bookId: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    publisher: { type: String, required: true, trim: true },
    publishYear: { type: Number, required: true, min: 0 },
    isbn: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    description: { type: String, trim: true, default: '' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);