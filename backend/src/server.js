const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const bookRoutes = require('./routes/bookRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.use('/api/books', bookRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Không tìm thấy endpoint' });
});

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && error.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'JSON request không hợp lệ' });
    }

    console.error(error);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server đang chạy trên cổng ${PORT}`);
            });
        })
        .catch(() => {
            process.exitCode = 1;
        });
}

module.exports = app;