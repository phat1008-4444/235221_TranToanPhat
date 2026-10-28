const Book = require('../models/Book');

const searchableFields = ['title', 'author', 'category'];

const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const handleError = (error, res) => {
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Dữ liệu sách không hợp lệ',
            errors: Object.values(error.errors).map(({ path, message }) => ({ path, message }))
        });
    }

    if (error.code === 11000) {
        return res.status(409).json({ message: 'bookId đã tồn tại' });
    }

    console.error(error);
    return res.status(500).json({ message: 'Lỗi máy chủ hoặc kết nối cơ sở dữ liệu' });
};

exports.getBooks = async (req, res) => {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
        const filter = search
            ? {
                $or: searchableFields.map((field) => ({
                    [field]: { $regex: escapeRegex(search), $options: 'i' }
                }))
            }
            : {};
        const books = await Book.find(filter).sort({ createdAt: -1 });
        res.status(200).json(books);
    } catch (error) {
        handleError(error, res);
    }
};

exports.getBookById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'id sách không hợp lệ' });
        }

        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Không tìm thấy sách' });
        }

        return res.status(200).json(book);
    } catch (error) {
        return handleError(error, res);
    }
};

exports.createBook = async (req, res) => {
    try {
        const book = await Book.create(req.body);
        return res.status(201).json(book);
    } catch (error) {
        return handleError(error, res);
    }
};

exports.updateBook = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'id sách không hợp lệ' });
        }

        const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!book) {
            return res.status(404).json({ message: 'Không tìm thấy sách' });
        }

        return res.status(200).json(book);
    } catch (error) {
        return handleError(error, res);
    }
};

exports.deleteBook = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'id sách không hợp lệ' });
        }

        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Không tìm thấy sách' });
        }

        return res.status(200).json({ message: 'Xóa sách thành công', book });
    } catch (error) {
        return handleError(error, res);
    }
};