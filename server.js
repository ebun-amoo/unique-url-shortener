import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

const links = {};
const originalUrl = "originalUrl";
const alias = 'abc-123';

app.get('/', (req, res) => {
  res.send("Welcome to Ebun's Unique URL Shortener!")
});

app.post('/shorten', (req, res) => {
  const {url} = req.body;
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