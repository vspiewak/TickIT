var express = require('express');
var app = express();

var code = 1;

app.get('/api/code', function(req, res) {
  code++;

  var ret = "" + code;
  var pad = "000";
  ret = pad.substring(0, pad.length - ret.length) + ret; 

  res.json({ code: ret });

});

app.listen(3000);

