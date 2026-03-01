import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

const links = {};
// const TEN_DAYS = 10 * 24 * 60 * 60 * 1000;
const TEN_DAYS = 30 * 60 * 1000;

app.get('/', (req, res) => {
  res.send("Welcome to Ebun's Unique URL Shortener!")
});

app.post('/shorten', (req, res) => {
  const { url } = req.body;
  let { alias } = req.body;

  if (!url) {
    return res.status(400).json({error: "URL is required"});
  }

  if (!alias) {
    alias = Math.random().toString(36).substring(2, 8);
  }

  if (links[alias]) {
    return res.status(400).json({error: "Alias already exists. Please choose a different one."});
  }

  links[alias] = {
    originalUrl: url,
    shortUrl: `http://localhost:${PORT}/${alias}`,
    createdAt: new Date().toISOString(),
    deleted: false,
    deletedAt: null
  }
  res.json({
    alias: alias,
    shortUrl: `http://localhost:${PORT}/${alias}`
  });
  console.log(links);
})

app.get('/:alias', (req, res) => {
  const { alias } = req.params;

  if (!alias) {
    return res.status(400).json({error: "Alias is required"});
  }

  const link = links[alias];

  if (!link) {
    return res.status(404).json({error: "Alias not found"});
  }

  const deletedTime = new Date(link.deletedAt).getTime();
  const now = Date.now();
  if (link.deleted === true && now - deletedTime > TEN_DAYS) {
    delete links[alias];
    return res.status(410).json({error: "Alias has been deleted"});
  }
  
  if (link.deleted === true && now - deletedTime < TEN_DAYS) {
    return res.status(410).json({error: "Alias has been deleted. Restore the within 10 days to use it again."});
  }

  if (link) {
    res.redirect(link.originalUrl);
    res.status(302).end();
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

  const deletedTime = new Date(link.deletedAt).getTime();
  const now = Date.now();
  if (link.deleted === true && now - deletedTime > TEN_DAYS) {
    delete links[alias];
    return res.status(410).json({error: "Alias has been permanently deleted and cannot be restored."});
  }

  links[alias].deleted = false;
  links[alias].deletedAt = null;
  res.json({message: "Alias has been successfully restored."})
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});