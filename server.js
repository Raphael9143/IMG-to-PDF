const express = require('express');
const path = require('path');
const fs = require('fs')
const uploadSingle = require('./routes/uploadFile')
const downloadFiles = require('./routes/download')

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.use('/uploadfile', uploadSingle)
app.use('/download', downloadFiles)

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});
