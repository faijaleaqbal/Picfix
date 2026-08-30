'use strict';

/** Syntax check every .js file under src/ */
const fs = require('fs');
const path = require('path');

let failures = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.js')) {
      try {
        require('node:child_process').execSync(`node --check "${full}"`, { stdio: 'pipe' });
        console.log('OK  ', path.relative(process.cwd(), full));
      } catch (err) {
        failures++;
        console.error('FAIL', path.relative(process.cwd(), full));
        console.error(err.stderr.toString());
      }
    }
  }
}

walk(path.join(__dirname, '..', 'src'));
if (failures) {
  console.error(`\n${failures} file(s) failed syntax check`);
  process.exit(1);
}
console.log('\nAll syntax checks passed');
