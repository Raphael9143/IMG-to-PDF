const { translate } = require("./utils/translate")

async function main() {
    try {
        const viText = await translate("Hello")
        console.log(viText)
    } catch(e) {
        console.log(e)
    }
};

main()