function Action(name,version) {
    this.name = name;
    this.version = version;
}


const path = require("path");
const cp = require("child_process");


cp.execSync("npm install mysql");

const mysql = require("mysql");

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
    return k[0].includes("uses");
});

//const base = JSON.parse(res.stdout.toString());
//const head = require(path.resolve(process.cwd(), file));
//console.log(`${base.name} v${base.version} => ${head.name} v${head.version}`);
//console.log(s);

var action_list = [];
for (i = 0; i < s.length; i++) {
    var temp = s[i].split(':');
    var action_version = temp[1].trim().split("@");
    var action = action_version[0];
    var version = action_version[1];
    action_list[i] = new Action(action, version);
}
var json_data = JSON.stringify(action_list);

console.log(json_data);
//console.log(`::set-output name=name::${actions}`);


let connection =mysql.createConnection({
    host: "rm-uf60x57re73u05414go.mysql.rds.aliyuncs.com",//连接本地计算机
    port:3306,//端口
    user:"ctt",//数据库账号
    password:"Hello123",//密码
    database:"action"//连接的数据库名
});

//调用connect方法创造连接
connection.connect((err)=>{//回调函数,如果报错会把err填充上
    if(err){
        console.error("连接失败"+err.stack);//打印堆栈信息
        return;
    }
    console.log("连接成功");
});


let sql = "INSERT INTO action(project,workflow,actions,last_modified) VALUES (?,?,?,now())";
//设置参数
let params=[event.repository.id, process.env.GITHUB_WORKFLOW, json_data];
connection.query(sql,params,(err,result)=>{
    if (err) {
        console.error("插入失败" + err.message);
        result;
    }
    console.log("插入成功");
});

//关闭数据库连接
connection.end();

// console.log(event.repository.url);
// console.log(event);

console.log(process);
