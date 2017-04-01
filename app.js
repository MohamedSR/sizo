var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');
var base58 = require('./base58.js');
var Url = require('./models/url');
var port = process.env.PORT || 8080;
mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.post('/api/sizo', function(req, res){
  var longUrl = req.body.url;
  var shortUrl = '';
    Url.findOne({long_url: longUrl}, function (err, doc){
    if (doc){
      shortUrl = config.webhost + base58.encode(doc._id);
      res.send({'shortUrl': shortUrl});
    } else {
      var newUrl = Url({
        long_url: longUrl
      });
      newUrl.save(function(err) {
        if (err){
          console.log(err);
        }
        shortUrl = config.webhost + base58.encode(newUrl._id);
        res.send({'shortUrl': shortUrl});
      });
    }
  });
});
app.get('/:encodedId', function(req, res){
  var encodedId = req.params.encodedId;
  var id = encodedId.decode(base58Id);
  Url.findOne({_id: id}, function (err, doc){
    if (doc) {
      res.redirect(doc.long_url);
    } else {
      res.redirect(config.webhost);
    }
  });
});
var server = app.listen(port);
