const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('FOODIGO server is running')
});

app.listen(port, () => {
    console.log(`FOODIGO server running on ${port}`);
})