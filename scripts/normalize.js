var fs = require('fs');
var utils = require('../src/util');

var files = fs.readdirSync('./results/tg_format/');

files.forEach(function(file) {
    const contents = fs.readFileSync('./results/tg_format/' + file, 'utf8');

    var actual = utils.write_tg(utils.read_tg(contents));

    fs.writeFile(
      './results/tg_format/' + file,
      actual,
      function() {
        console.log(
          'Successfully normalized ' + file
        );
      }
    );
});
