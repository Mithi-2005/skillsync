import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse-new");

/**
 * Extracts text from a PDF buffer.
 * @param {Buffer} fileBuffer
 * @returns {Promise<string>}
 */
export const extractTextFromPDF = async (fileBuffer) => {
    try {
        if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
            throw new Error("Invalid input: Expected a file Buffer.");
        }

        const data = await pdf(fileBuffer);

        const text = data.text
          .replace(/\n{2,}/g, "\n")
          .replace(/\s{2,}/g, " ")
          .trim();

        return text;

    } catch (error) {
        console.error("PDF Parsing Error:", error.message);
        throw new Error("Failed to extract text from PDF");
    }
};