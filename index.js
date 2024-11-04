const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});






// const ocr = require("./utils/ocr");
// const { createPDF } = require("./utils/pdf");
// const { translate } = require("./utils/translate");
// const express = require('express')

// (async () => {
//     try {
//         var text = await ocr.image2text("./data/sample.png");
//         console.log(text)
//         var fs = require('fs');
//         var enText = formattedText(fs.readFileSync('stdout.txt').toString());
//         console.log("Eng text: " + enText);
//         var viText = await translate(enText)
//         console.log("viet text: " + viText);
//         const pdfFile = createPDF(viText);
//         console.log("This is PDF file: " + pdfFile)
//     } catch (e) {
//         console.log(e);
//     }
// })();

// function formattedText(text) {
//     for (var i = 0; i < text.length - 1; i++) {
//         if (text[i] == "\n" && text[i + 1] == "\n") {
//             text = text.slice(0, i) + text.slice(i + 1)
//         }
//     }
//     return text
// }