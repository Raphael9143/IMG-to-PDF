const express = require('express');
const path = require('path');
const multer = require('multer') //handling file uploads
const fs = require('fs')

const app = express();
const PORT = 3000;

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});

//set multer storage
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

var upload = multer({ storage: storage })


app.post('/uploadfile', upload.single('singleImage'), (req, res, next) => {
  try {
      const file = req.file;
      if (!file) {
          return res.status(400).json({ error: 'Please upload a file!' });
      }
      res.json(file);
  } catch (error) {
      console.error("Error during file upload:", error);
      res.status(500).json({ error: 'An error occurred during file upload' });
  }
});

app.post('/uploadmultiple', upload.array('multipleImage', 5), (req, res, next) => {
  try {
      const files = req.files;
      if (!files || files.length === 0) {
          return res.status(400).json({ error: 'Please upload one or more files!' });
      }
      res.json(files);
  } catch (error) {
      console.error("Error during multiple file upload:", error);
      res.status(500).json({ error: 'An error occurred during multiple file upload' });
  }
});
