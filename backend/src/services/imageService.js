const fs = require("fs");
const path = require("path");

const uploadsDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function convertPdfToImage(pdfPath) {
  let pdf2img;
  try {
    pdf2img = require("pdf-img-convert");
  } catch (err) {
    throw new Error(
      "pdf-img-convert is not available (canvas native module may not be installed). " +
      "PDF upload is disabled in this environment."
    );
  }
  const outputImages = await pdf2img.convert(pdfPath);
  const imagePath = path.join(uploadsDir, `${Date.now()}.png`);
  fs.writeFileSync(imagePath, outputImages[0]);
  return imagePath;
}

function getImageDataUrl(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const imageBase64 = imageBuffer.toString("base64");
  const imageFormat = path.extname(imagePath).slice(1);
  return `data:image/${imageFormat};base64,${imageBase64}`;
}

module.exports = {
  convertPdfToImage,
  getImageDataUrl,
};
