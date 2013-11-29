var express = require('express');
var app = express();

var code = 1;

app.get('/api/code', function(req, res) {
  code++;
  res.json(code);
});

app.listen(3000);

