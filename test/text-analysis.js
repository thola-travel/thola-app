/**
 * Unit test for the open-response analyzer: phrase matching, left word
 * boundaries, stem extension, and the negation window.
 *
 * Usage: node test/text-analysis.js
 */

const fs = require('fs');
const path = require('path');
const DB = require('../public/quiz-data.js');

// Extract analyzeText from app.js so the test runs the real implementation.
const appSrc = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8');
const start = appSrc.indexOf('function analyzeText');
const end = appSrc.indexOf('function collectTextResponses');
if (start < 0 || end < 0) {
  console.error('TEXT TEST FAIL: analyzeText not found in app.js');
  process.exit(1);
}
const analyzeText = new Function(
  'CATEGORIES',
  'KEYWORDS',
  'NEGATION_TERMS',
  appSrc.slice(start, end) + '\nreturn analyzeText;'
)(DB.CATEGORIES, DB.KEYWORDS, DB.NEGATION_TERMS);

const keysOf = (themes) => themes.map((t) => t.key);
const failures = [];
function expect(desc, cond) {
  if (!cond) failures.push(desc);
}

let t = analyzeText('I love being tied up with rope and getting spanked.');
expect('detects rope', keysOf(t).includes('rope'));
expect('detects bondage phrase (tied up)', keysOf(t).includes('bondage'));
expect('detects impact stem (spanked)', keysOf(t).includes('impact'));

t = analyzeText('I am not into feet and I never liked latex.');
expect('negated feet excluded', !keysOf(t).includes('feet'));
expect('negated latex excluded', !keysOf(t).includes('materials'));

t = analyzeText('Something about a strict professor scenario with lots of dirty talk.');
expect('detects authority (professor)', keysOf(t).includes('authority'));
expect('detects dirty talk phrase', keysOf(t).includes('dirtytalk'));
expect('detects roleplay (scenario)', keysOf(t).includes('roleplay'));

t = analyzeText('The carpet and the escape room were fun.');
expect('no false positive on carpet/escape (word boundaries)', keysOf(t).length === 0);

t = analyzeText('Being praised, like good girl, completely undoes me.');
expect('detects praise phrase (good girl)', keysOf(t).includes('praise'));

t = analyzeText('');
expect('empty input yields no themes', keysOf(t).length === 0);

t = analyzeText('I want to be hypnotized and put in a trance.');
expect('detects hypno stem', keysOf(t).includes('hypno'));

if (failures.length) {
  console.error('TEXT TEST FAIL:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('TEXT TEST PASS (8 scenarios)');
