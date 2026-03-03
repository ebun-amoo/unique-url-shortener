import express from 'express';
import fs from "fs";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = 3000;

app.use(express.json());

const limiter = rateLimit({
   windowMs: 60 * 1000,
   max: 10,
   standardHeaders: true,
   legacyHeaders: false
});

app.use(limiter);

let links = {};

try {
   const data = fs.readFileSync("db.json", "utf-8");
   links = JSON.parse(data);
} catch (err) {
   links = {};
}

// const TEN_DAYS = 10 * 24 * 60 * 60 * 1000;
const TEN_DAYS = 30 * 60 * 1000;

function isExpired(link) {
  if (!link.deletedAt) return false;
  return Date.now() - new Date(link.deletedAt).getTime() > TEN_DAYS;
}

let saveScheduled = false;

function bufferedSave() {
  if (saveScheduled) return;

  saveScheduled = true;

  setTimeout(() => {
    fs.writeFile("db.json", JSON.stringify(links, null, 2), () => {
      saveScheduled = false;
    });
  }, 1000);
}

app.get('/', (req, res) => {
  res.send("Welcome to Ebun's Unique URL Shortener!")
});

app.post('/shorten', (req, res) => {
  const { url } = req.body;
  let { alias } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  if (!alias) {
    do {
      alias = Math.random().toString(36).substring(2, 8);
    } while (links[alias] && !isExpired(links[alias]));
  }

  if (links[alias] && !links[alias].deleted) {
    return res.status(400).json({
      error: "Alias already exists. Choose a different one."
    });
  }

  if (links[alias] && links[alias].deleted && !isExpired(links[alias])) {
    return res.status(400).json({
      error: "Alias has been deleted. Restore it or choose a different one."
    });
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  links[alias] = {
    originalUrl: url,
    shortUrl: `${baseUrl}/${alias}`,
    createdAt: new Date().toISOString(),
    deleted: false,
    deletedAt: null
  };

  bufferedSave();

  return res.status(201).json({
    alias,
    shortUrl: `${baseUrl}/${alias}`
  });
});

app.get('/:alias', (req, res) => {
  const { alias } = req.params;

  if (!alias) {
    return res.status(400).json({error: "Alias is required"});
  }

  const link = links[alias];

  if (!link) {
    return res.status(404).json({error: "Alias not found"});
  }

  if (link.deleted) {
    if (isExpired(link)) {
      delete links[alias];
      bufferedSave();
      return res.status(410).json({
        error: "Alias has been permanently deleted."
      });
    }

    return res.status(410).json({
      error: "Alias has been deleted. Restore within 10 days to use again."
    });
  }

  if (link) {
    return res.redirect(302, link.originalUrl);
  }
});

app.delete('/:alias', (req, res) => {
  const { alias } = req.params;
  if (!alias) {
    return res.status(400).json({error: "Alias is required"});
  }

  if (!links[alias]) {
    return res.status(404).json({error: 'Alias does not exist.'});
  }

  links[alias].deleted = true;
  links[alias].deletedAt = new Date().toISOString();
  bufferedSave();

  res.json({message: "Alias deleted successfully."});
})

app.patch('/restore/:alias', (req, res) => {
  const { alias } = req.params;
  if (!alias) {
    return res.status(400).json({error: "Alias is required"});
  }

  const link = links[alias];

  if (!link) {
    return res.status(404).json({error: 'Alias does not exist.'});
  }

  if (link.deleted === false) {
    return res.json({message: "Alias is not deleted. No need to restore."});
  }

  if (isExpired(link)) {
    delete links[alias];
    bufferedSave();
    return res.status(410).json({error: "Alias has been permanently deleted and cannot be restored."});
  }

  links[alias].deleted = false;
  links[alias].deletedAt = null;
  bufferedSave();
  res.json({message: "Alias has been successfully restored."})
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});