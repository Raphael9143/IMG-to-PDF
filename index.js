const ocr = require("./utils/ocr");
const { createPDF } = require("./utils/pdf");
const { translate } = require("./utils/translate");

(async () => {
    try {
        const text = await ocr.image2text("./data/sample.png");
        var fs = require('fs');
        var viText = fs.readFileSync('stdout.txt').toString();
        console.log("viet text: " + viText);
        const pdfFile = createPDF(viText);
        console.log("This is PDF file: " + pdfFile)
    } catch (e) {
        console.log(e);
    }
})();
