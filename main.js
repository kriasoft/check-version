const path = require("path");
const cp = require("child_process");

function indexOrEnd(str, q) {
    return str.indexOf(q) === -1 ? str.length : str.indexOf(q);
}


const event = require(process.env.GITHUB_EVENT_PATH);
const {INPUT_PATH, INPUT_TOKEN} = process.env;
const file = path.join(INPUT_PATH, "main2.yml");

// Fetch the base package.json file
// https://developer.github.com/v3/repos/contents/#get-contents
const res = cp.spawnSync("curl", [
    "--header",
    "Accept: application/vnd.github.v3.raw",
    "--header",
    `Authorization: token ${INPUT_TOKEN}`,
    //`${event.repository.url}/contents/${file}?ref=${event.pull_request.base.sha}`,
    `${event.repository.url}/contents/${file}`,
  ]);
  
if (res.status != 0) {
    console.log(`::error ::${res.stderr.toString()}`);
    process.exit(res.status);
}

const str = res.stdout.toString();

var s= str.split("\n").filter(function(e){
    var k=e.split(":");
    return k[0].trim()=="uses";
});

//const base = JSON.parse(res.stdout.toString());
//const head = require(path.resolve(process.cwd(), file));
//console.log(`${base.name} v${base.version} => ${head.name} v${head.version}`);
//console.log(s);

var actions = "";

for (i = 0; i < s.length; i++) {
    var temp = s[i].split(':');
    var action = temp[1].trim();
    //console.log(action);  
    actions = actions + " " + action;
}
console.log(`::set-output name=name::${actions}`);
