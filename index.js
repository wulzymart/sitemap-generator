const SitemapGenerator = require("sitemap-generator");
const express = require("express");
const app = express();
const { createReadStream, unlinkSync } = require("fs");
app.get("/", (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("url is required");
  }
  const path = new URL(url).host.split(".")[0];
  const generator = SitemapGenerator(url, {
    maxDepth: 0,
    filepath: `${path}.sitemap.xml`,
    maxEntriesPerFile: 50000,
    stripQuerystring: true,
  });

  generator.on("done", () => {
    try {
      res.setHeader("Content-Type", "application/xml");
      const sender = createReadStream(`${path}.sitemap.xml`);
      sender.pipe(res);
      sender.on("end", () => {
        res.end();
        unlinkSync(`${path}.sitemap.xml`);
      });
    } catch (error) {
      console.log(error);
    }
  });
  generator.on("error", (error) => {
    console.log(error);
  });

  generator.start();
});

app.listen(9000, () => {
  console.log("Sitemap generator Server started on port 9000");
});
