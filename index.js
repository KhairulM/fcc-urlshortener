require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');

const app = express();

let Url = require('./models/url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async function (req, res) {
  let inputUrl = req.body['url'];
  let { hostname } = url.parse(inputUrl);

  if (!hostname) {
    res.json({ 'error': 'invalid url' });
    return;
  }

  // check if url is valid
  dns.lookup(hostname, async function (err) {
    if (err && err.code === 'ENOTFOUND') {
      // url is invalid
      res.json({ 'error': 'invalid url' });
      return;
    }

    // find expanded address if exist in the database
    let doc = await Url.findOne({ expanded: inputUrl }).exec();
    if (doc) {
      res.json({ 'original_url': inputUrl, 'short_url': doc.short });
      return;
    }

    // create a new document
    try {
      let currentCount = await Url.estimatedDocumentCount().exec();

      await Url.create({ short: currentCount, expanded: inputUrl });
      res.json({ 'original_url': inputUrl, 'short_url': currentCount });
    } catch (e) {
      res.json({ 'error': e.toString() });
    }
  });
});

app.get('/api/shorturl/:short', async function (req, res) {
  let shortIndex = req.params['short'];

  // check if shortIndex is valid
  if (isNaN(shortIndex)) {
    res.json({ 'error': 'Wrong format' });
    return;
  }

  // find short in database
  let doc = await Url.findOne({ short: parseInt(shortIndex) }).exec();
  if (!doc) {
    res.json({ 'error': 'No short URL found for the given input' });
    return;
  }

  res.redirect(doc.expanded);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
