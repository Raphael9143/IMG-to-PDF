
// app.post('/uploadfile', upload.single('singleImage'), (req, res, next) => {
//     const file = req.file
//     if (!file) {
//       const error = new Error('Please upload a file!')
//       error.httpStatusCode = 400
//       return next(error)
//     }
//     res.send(file)
// })

// app.post('/uploadmultiple', upload.array('multipleImage', 5), (req, res, next) => {
//     const files = req.files
//     if (!files) {
//         const error = new Error('Please choose files!')
//         error.httpStatusCode = 400
//         return next(error)
//     }
//     res.send(files)
// })



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