const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const uniqueValidator = require('mongoose-unique-validator');

const dns = require('dns');

const urlValidator = async (url) => {
  return new Promise((resolve, reject) => {
    
    dns.lookup(url.replace(/^https?:\/\//i, ''), (err, address, family) => {
      if (err) reject(err);
      resolve(address);
    });
  });
};

const generateHash = require('./hash');

const Schema = mongoose.Schema;
const ShortUrlSchema = new Schema({
  originalUrl: {
    type: String,
    validate: {
      validator: urlValidator,
      message: "invalid URL"
    },
    required: [true, 'User phone number required']
  },
  hash: {
    type: String,
    unique: true
  }
});
ShortUrlSchema.plugin(uniqueValidator);

const ShortUrl = mongoose.model('ShortUrl', ShortUrlSchema);

const createAndSaveWithHash = (url, hash, done) => {
  if (hash) {
    hash = generateHash(url + Date.now());
  }
  else {
    hash = generateHash(url);
  }
  
  const shortUrl = new ShortUrl({originalUrl: url,
                                 hash: hash});
  shortUrl.save((err) => {
    if (err) {
      if (err.errors.hash.kind === 'unique') {
        createAndSaveWithHash(url, hash, done);
        return;
      }
      return done(err);
    }
    done(null, shortUrl);
  })
}

const createAndSaveUrl = (url, done) => {
  createAndSaveWithHash(url, null, done);
}

const findShortUrlById = (id, done) => {
  ShortUrl.findById(id, (err, shortUrl) => {
    if (err) {
      return done(err);
    }
    done(null, shortUrl);
  })
}

const findOneByHash = (hash, done) => {
  ShortUrl.findOne({hash: hash}, (err, shortUrl) => {
    if (err) {
      return done(err);
    }
    done(null, shortUrl);
  })
}


exports.createAndSaveUrl = createAndSaveUrl;
exports.findShortUrlById = findShortUrlById;
exports.findOneByHash = findOneByHash;