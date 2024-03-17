/**
 * Check Version Action for GitHub
 * https://github.com/marketplace/actions/check-version
 */

const path = require("path");
const cp = require("child_process");
const fs = require("fs")
const os = require("os")

// If the semver string a is greater than b, return 1. If the semver string b is greater than a, return -1. If a equals b, return 0;
var semver =
  /^[v^~<>=]*?(\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+))?(?:-([\da-z\-]+(?:\.[\da-z\-]+)*))?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?)?)?$/i;

function indexOrEnd(str, q) {
  return str.indexOf(q) === -1 ? str.length : str.indexOf(q);
}

function split(v) {
  var c = v.replace(/^v/, '').replace(/\+.*$/, '');
  var patchIndex = indexOrEnd(c, '-');
  var arr = c.substring(0, patchIndex).split('.');
  arr.push(c.substring(patchIndex + 1));
  return arr;
}

function tryParse(v) {
  var n = parseInt(v, 10);
  return isNaN(n) ? v : n;
}

function validateAndParse(v) {
  if (typeof v !== 'string') {
    throw new TypeError('Invalid argument expected string');
  }
  var match = v.match(semver);
  if (!match) {
    throw new Error(
      "Invalid argument not valid semver ('" + v + "' received)"
    );
  }
  match.shift();
  return match;
}

function semverCompare(v1, v2) {
  [v1, v2].forEach(validateAndParse);

  var s1 = split(v1);
  var s2 = split(v2);

  for (var i = 0; i < Math.max(s1.length - 1, s2.length - 1); i++) {
    var n1 = parseInt(s1[i] || 0, 10);
    var n2 = parseInt(s2[i] || 0, 10);

    if (n1 > n2) return 1;
    if (n2 > n1) return -1;
  }

  var sp1 = s1[s1.length - 1];
  var sp2 = s2[s2.length - 1];

  if (sp1 && sp2) {
    var p1 = sp1.split('.').map(tryParse);
    var p2 = sp2.split('.').map(tryParse);

    for (i = 0; i < Math.max(p1.length, p2.length); i++) {
      if (
        p1[i] === undefined ||
        (typeof p2[i] === 'string' && typeof p1[i] === 'number')
      )
        return -1;
      if (
        p2[i] === undefined ||
        (typeof p1[i] === 'string' && typeof p2[i] === 'number')
      )
        return 1;

      if (p1[i] > p2[i]) return 1;
      if (p2[i] > p1[i]) return -1;
    }
  } else if (sp1 || sp2) {
    return sp1 ? -1 : 1;
  }

  return 0;
}

// Input parameters. See action.yaml
const { INPUT_PATH, INPUT_TOKEN, INPUT_FORMAT } = process.env;

const event = require(process.env.GITHUB_EVENT_PATH);
const file = path.join(INPUT_PATH, "package.json");

// Fetch the base package.json file
// https://developer.github.com/v3/repos/contents/#get-contents
const res = cp.spawnSync("curl", [
  "--header",
  "Accept: application/vnd.github.v3.raw",
  "--header",
  `Authorization: token ${INPUT_TOKEN}`,
  `${event.repository.url}/contents/${file}?ref=${event.pull_request.base.sha}`,
]);

if (res.status != 0) {
  console.log(`::error ::${res.stderr.toString()}`);
  process.exit(res.status);
}

const base = JSON.parse(res.stdout.toString());
const head = require(path.resolve(process.cwd(), file));

console.log(`${base.name} v${base.version} => ${head.name} v${head.version}`);

if (base.name == head.name) {
  if (base.version === head.version) {
    console.log(`::error file=${file},line=3::Requires a new version number.`);
    process.exit(1);
  }

  const versionDiffResult = semverCompare(base.version, head.version);

  if (versionDiffResult === 1 || versionDiffResult === 0) {
    console.log(
      `::error file=${file},line=3::Requires a newer version number.`
    );
    process.exit(1);
  }
} else {
  console.log(`::warning file=${file},line=2::Package has a different name.`);
}

// Release name, e.g. "api_v1.0.0+build.345.zip"
const release = INPUT_FORMAT.replace(/\{pkg\}/gi, head.name)
  .replace(/\{name\}/gi, head.name)
  .replace(/\{version\}/gi, head.version)
  .replace(/\{pr\}/gi, event.pull_request.number)
  .replace(/\{pr_number\}/gi, event.pull_request.number);

// Set the action output values (name, version, release)
const output = process.env['GITHUB_OUTPUT']
fs.appendFileSync(output, `name=${head.name}${os.EOL}`)
fs.appendFileSync(output, `version=${head.version}${os.EOL}`)
fs.appendFileSync(output, `release=${release}${os.EOL}`)
