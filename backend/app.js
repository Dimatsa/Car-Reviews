const port = process.env.PORT || 3000;

const path = require("path");
const express = require('express');
const app = express();

// Main webpage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/', 'index.html'));
});


app.listen(port, () => console.log(`Listening on port ${port}...`));