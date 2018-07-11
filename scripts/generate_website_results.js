var utils = require('../src/util');
var fs = require('fs');

const events = [];
const results = [];

fs.readdir('./results/tg_format/', function(err, files) {
  if (err) throw err;
  let numFiles = 0;
  files.forEach(function(file) {
    console.log(`Reading ${file}`);
    const contents = fs.readFileSync('./results/tg_format/' + file, 'utf8');
    const event = utils.read_tg(contents);
    numFiles++;
    events.push(event);
  });

  const genders = ['Men', 'Women'];
  const sets = [
    'Town Bumps',
    'Lent Bumps',
    'May Bumps',
    'Torpids',
    'Summer Eights',
  ];

  const smalls = ['Town', 'Lents', 'Mays', 'Torpids', 'Eights'];

  genders.forEach(gender => {
    sets.forEach((set, i) => {
      const transformedEvents = events
        .filter(e => e.gender.toLowerCase() === gender.toLowerCase())
        .filter(e => e.set === set)
        .sort((a, b) => a.year - b.year)
        .map(utils.transformData);

      const joinedEvents = utils.joinEvents(transformedEvents, set, gender);

      joinedEvents.set = set;
      joinedEvents.gender = gender;
      joinedEvents.small = smalls[i];

      results.push(joinedEvents);
    });
  });

  fs.writeFile(
    './website_results.json',
    JSON.stringify(results),
    function() {
      console.log('Scccessfully wrote file to ./website_results.json');
    }
  );

  console.log(`Found ${numFiles} files`);
});
