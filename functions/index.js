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

const onScreenShot = onRequest(
  {
    memory: "2GiB",
  },
  async (request, response) => {
    const { url, size, element, isMobile = false } = request.query;

    if (!url) {
      return response
        .status(400)
        .send("Please provide a URL. Example: ?url=https://example.com");
    }

    // Default to a reasonably large viewport for full page screenshots.
    const viewport = {
      width: 1280,
      height: 1024,
      deviceScaleFactor: 2,
    };

    let fullPage = true;
    if (size) {
      const [width, height] = size.split(",").map((item) => Number(item));
      if (!(isFinite(width) && isFinite(height))) {
        return response
          .status(400)
          .send("Malformed size parameter. Example: ?size=800,600");
      }
      viewport.width = width;
      viewport.height = height;
      viewport.isMobile = isMobile;

      fullPage = false;
    }

    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto(url, { waitUntil: "networkidle0" });

      // Set screen size
      await page.setViewport(viewport);

      const opts = {
        fullPage,
        encoding: "binary",
        // omitBackground: true
      };

      if (!fullPage) {
        opts.clip = {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        };
      }

      if (element) {
        const elementHandle = await page.$(element);
        if (!elementHandle) {
          return response.status(404).send(`Element ${element} not found`);
        }
        buffer = await elementHandle.screenshot();
      } else {
        buffer = await page.screenshot(opts);
      }
      response.type("image/png").send(buffer);
    } catch (err) {
      response.status(500).send(err.toString());
    }
  }
);

exports.helloWorld = onScreenShot;
exports.onScreenShot = onScreenShot;
