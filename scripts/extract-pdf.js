const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('/Users/jakob/Downloads/Document/ferheng.pdf');

// Handle potential export differences
const parsePdf = pdf.default || pdf;

parsePdf(dataBuffer).then(function (data) {
    fs.writeFileSync('ferheng_extract.txt', data.text);
    console.log('Extraction complete. Characters:', data.text.length);
}).catch(err => {
    console.error('Error parsing PDF:', err);
});
