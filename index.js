
const ocr = require("./utils/ocr");
const { createPDF } = require("./utils/pdf");
const { translate } = require("./utils/translate");

(async () => {
    try {
        var text = await ocr.image2text("uploads\\sample.png");
        var fs = require('fs');
        var enText = formattedText(fs.readFileSync('stdout.txt').toString());
        var viText = await translate(enText)
        const pdfFile = createPDF(viText);
        console.log("This is PDF file: " + pdfFile)
    } catch (e) {
        console.log(e);
    }
})();

function formattedText(text) {
    for (var i = 0; i < text.length - 1; i++) {
        if (text[i] == "\n" && text[i + 1] == "\n") {
            text = text.slice(0, i) + text.slice(i + 1)
        }
    }
    return text
}