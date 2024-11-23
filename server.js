const express = require('express');
const path = require('path');
const uploadSingle = require('./routes/upload_single')
const uploadMultiple = require('./routes/upload_multiple')
const downloadFiles = require('./routes/download')
const { startFilters } = require('./filters/startFilters');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.use('/uploadfile', uploadSingle)
app.use('/uploadmultiple', uploadMultiple)
app.use('/download', downloadFiles)

startFilters()

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});
