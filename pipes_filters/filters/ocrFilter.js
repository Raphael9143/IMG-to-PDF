const { image2text } = require('../../utils/ocr');

class ocrFilter {
  async process(message) {
    const { filePath, fileName } = message;
    const text = await image2text(filePath);
    console.log("ocr text successfully created ")

    //todo: refactor text 
    const outputMessage = { text, outputFilePath: `${fileName}.pdf` };
    return outputMessage
  }
}

module.exports = ocrFilter 
