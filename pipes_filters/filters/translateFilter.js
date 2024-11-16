const { translate } = require('../../utils/translate');

class translateFilter {
    async process(message) {
        const viText = await translate(message.text);
        console.log('translated text succesfully')
        // todo: refactor text
        const output = message.outputFilePath
        return { viText, output }
    }

}

module.exports = translateFilter
