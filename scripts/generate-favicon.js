import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 48, 64, 128, 256];
const inputFile = path.join(__dirname, "../public/logo.png");
const outputDir = path.join(__dirname, "../public");

async function generateFavicons() {
  try {
    // Create favicon.ico (multi-size ICO file)
    const icoSizes = [16, 32, 48];
    const icoBuffers = await Promise.all(
      icoSizes.map((size) =>
        sharp(inputFile).resize(size, size).toFormat("png").toBuffer()
      )
    );

    // Write favicon.ico
    const icoPath = path.join(outputDir, "favicon.ico");
    fs.writeFileSync(icoPath, Buffer.concat(icoBuffers));
    console.log("Generated favicon.ico");

    // Generate PNG favicons
    for (const size of sizes) {
      const outputFile = path.join(outputDir, `favicon-${size}x${size}.png`);
      await sharp(inputFile).resize(size, size).toFile(outputFile);
      console.log(`Generated ${outputFile}`);
    }

    // Copy original logo to Strapi backend
    const strapiPublicDir = path.join(__dirname, "../backend/public");
    const strapiFaviconPath = path.join(strapiPublicDir, "favicon.ico");
    fs.copyFileSync(icoPath, strapiFaviconPath);
    console.log("Copied favicon.ico to Strapi public directory");
  } catch (error) {
    console.error("Error generating favicons:", error);
    process.exit(1);
  }
}

generateFavicons();
