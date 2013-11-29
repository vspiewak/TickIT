var express = require('express');
var app = express();

var code = 1;

function leftPad(val) {
  var ret = "" + val;
  var pad = "000";
  return pad.substring(0, pad.length - ret.length) + ret;
}

app.use("/", express.static(__dirname + '/public'));

app.get('/api/code', function(req, res) {
  var ret = leftPad(code++);

  res.json({ code: ret });

});

app.listen(3000);

