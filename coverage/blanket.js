var path = require('path');
var srcDir = path.join(__dirname, '..', 'server');

require('blanket')({
  'pattern': srcDir,
  'data-cover-never': /spec/
});
