const { PDFParse } = require("pdf-parse");

/**
 * Extract text from a PDF buffer.
 *
 * @param {Buffer} pdfBuffer
 * @returns {Promise<string>}
 */
async function extractPdfText(pdfBuffer) {
    let parser;

    try {
        parser = new PDFParse({
            data: pdfBuffer
        });

        const result = await parser.getText();

        const text = (result.text || "").trim();

        if (!text) {
            throw new Error(
                "No readable text was found in this PDF."
            );
        }

        return text;
    } finally {
        if (parser) {
            await parser.destroy();
        }
    }
}

module.exports = extractPdfText;