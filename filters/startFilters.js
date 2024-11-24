const { startOCRFilter } = require('./ocrFilter');
const { startTranslateFilter } = require('./translateFilter');
const { startPDFFilter } = require('./pdfFilter');

function startFilters() {
    startOCRFilter();
    startTranslateFilter();
    startPDFFilter();
    console.log('All filters are now listening to their queues.');
}

module.exports = { startFilters };
