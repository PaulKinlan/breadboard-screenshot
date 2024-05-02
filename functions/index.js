/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const puppeteer = require("puppeteer");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

process.env.PUPPETEER_CACHE_DIR = process.env.NODE_PATH + "/.puppeteer_cache";

exports.helloWorld = onRequest(
  {
    memory: "2GiB",
  },
  async (request, response) => {
    const { url } = request.query;

    if (!url) {
      response.status(400).send("URL is required");
      return;
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto(url);

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    const data = await page.screenshot({ encoding: "binary" });

    await browser.close();
    response.writeHead(200, {
      "Content-Disposition": "attachment;filename=screenshot.png",
      "Content-Type": "image/png",
      "Content-Length": data.length,
      "Access-Control-Expose-Headers": "Content-Disposition",
    });
    response.end(data);
  }
);
