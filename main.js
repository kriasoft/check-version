/**
 * Check Version Action for GitHub
 * https://github.com/marketplace/actions/check-version
 */

const path = require("path");
const cp = require("child_process");

// If the semver string a is greater than b, return 1. If the semver string b is greater than a, return -1. If a equals b, return 0;
function semverCompare(a, b) {
  const pa = a.split(".");
  const pb = b.split(".");

  for (let i = 0; i < 3; i++) {
    const na = Number(pa[i]);
    const nb = Number(pb[i]);
    if (na > nb) return 1;
    if (nb > na) return -1;
    if (!isNaN(na) && isNaN(nb)) return 1;
    if (isNaN(na) && !isNaN(nb)) return -1;
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
console.log(`::set-output name=name::${head.name}`);
console.log(`::set-output name=version::${head.version}`);
console.log(`::set-output name=release::${release}`);
