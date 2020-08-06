const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const apiRouter = express.Router();

const dao = require('./dao');

const BASE64_TABLE = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM_$'

const idToBase64 = (id) => {
  //TODO
  const idStr= id.toString();
  var base64 = '';
  for (let i = 0; i < 24; i += 3) {
    console.log(i);
    let code = Number.parseInt(idStr.substring(i, i + 3), 16);
    console.log(code);
    base64 += BASE64_TABLE.charAt(Math.round(code / 64));
    base64 += BASE64_TABLE.charAt(code % 64);
    console.log(base64);
  }
  return base64;
}

const base64ToId = (base64) => {
  const idStr = '';
  for (let i = 0; i < 8; i ++) {
    idStr += BASE64_TABLE.indexOf(base64.charAt(i)).toString(64);
  }
  return new mongoose.Types.ObjectId(idStr);
}

apiRouter.use(bodyParser.urlencoded({extended: false}));

apiRouter.get("/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

apiRouter.post('/shorturl/new', (req, res) => {
  const originalUrl = req.body.url;
  
  dao.createAndSaveUrl(originalUrl, (err, urlEntity) => {
    if (err) {
      res.json({error: err});
      return;
    }
    res.json({original_url: originalUrl, shortUrl: urlEntity.hash});
  })
})

apiRouter.get('/shorturl/:shortUrl', (req, res) => {
  dao.findOneByHash(req.params.shortUrl, (err, shortUrl) => {
    if (err) {
      res.status(404).json(err);
      return;
    }
    res.redirect(shortUrl.originalUrl);
  })
})

module.exports = apiRouter;