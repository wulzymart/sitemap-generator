const SitemapGenerator = require("sitemap-generator");
const express = require("express");
const app = express();
const { createReadStream, unlinkSync } = require("fs");
app.get("/", (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("url is required");
  }
  let returned = false;
  const path = new URL(url).host.split(".")[0];
  const generator = SitemapGenerator(url, {
    maxDepth: 0,
    filepath: `${path}.sitemap.xml`,
    maxEntriesPerFile: 50000,
    stripQuerystring: true,
  });
  generator.on("add", (data) => {
    console.log(data);
  });
  generator.on("done", () => {
    if (returned) return;
    try {
      res.setHeader("Content-Type", "application/xml");
      let sender;
      try {
        sender = createReadStream(`${path}.sitemap.xml`);
      } catch (error) {
        console.log("error in done");
        res.status(400).send(error);
      }
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
    res.status(400).send(error);
    returned = true;
  });

  generator.start();
});

app.listen(9000, () => {
  console.log("Sitemap generator Server started on port 9000");
});
