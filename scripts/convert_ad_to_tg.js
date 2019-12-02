const utils = require('../src/util');
const fs = require('fs');

if (!fs.existsSync('./results/converted_tg_results/')) {
  fs.mkdirSync('./results/converted_tg_results/');
}

fs.readdir('./results/ad_format_temp/', function(err, files) {
  if (err) throw err;
  let numFiles = 0;
  files.forEach(function(file) {
    const contents = fs.readFileSync(
      './results/ad_format_temp/' + file,
      'utf8'
    );
    const event = utils.read_ad(contents);
    numFiles++;

    const set = file[0] === 'e' ? 'eights' : 'torpids';
    const year = file.slice(1, 5);
    const gender = file[5] === 'w' ? 'women' : 'men';
    const newFile = set + year + '_' + gender + '.txt';

    fs.writeFile(
      './results/converted_tg_results/' + newFile,
      utils.write_tg(utils.abbreviate(event)),
      function() {
        console.log(
          'Successfully converted ' + file + ' to produce ' + newFile
        );
      }
    );
  });

  console.log(`Found ${numFiles} files`);
});
