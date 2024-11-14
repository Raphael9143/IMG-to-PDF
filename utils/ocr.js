const tesseract = require("node-tesseract-ocr")

async function image2text(path) {
  try {
    const text = await tesseract.recognize(path, {
      lang: 'eng'
    })
    return text
  } catch (error) {
    console.error('OCR error: ', error)
    return null
  }
}

module.exports = {
  image2text
}

