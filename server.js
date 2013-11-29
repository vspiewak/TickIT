var express = require('express');
var app = express();

var code = 0;

function leftPad(val) {
  var ret = "" + val;
  var pad = "000";
  return pad.substring(0, pad.length - ret.length) + ret;
}

app.use("/", express.static(__dirname + '/public'));

app.get('/api/code', function(req, res) {
  code++;
  var ret = leftPad(code);
  res.json({ code: ret });
});

app.get('/api/reset', function(req, res) {
  code = 0;
  res.send(200);
});

app.listen(3000);

