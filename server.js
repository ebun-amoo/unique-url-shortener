import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

const links = {};
const originalUrl = "originalUrl";
// let id = 'abc-123';

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
    shortUrl: `http://localhost:${PORT}/${alias}`
  }
  res.json({
    alias: alias,
    shortUrl: `http://localhost:${PORT}/${alias}`
  });
  console.log(links);
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});