function Action(name,version) {
    this.name = name;
    this.version = version;
}

const path = require("path"); 
const cp = require("child_process");
cp.execSync("npm install mysql");

//const mysql = require("mysql");

const event = require(process.env.GITHUB_EVENT_PATH);
const {INPUT_PATH, INPUT_FILE, INPUT_TOKEN} = process.env;
var file = path.join(INPUT_PATH, INPUT_FILE);

// var regex = new RegExp(process.env.GITHUB_WORKSPACE+"(\\S*)");
// var action_file = process.argv[1];
// console.log(process.env.GITHUB_WORKSPACE);
// console.log(action_file);
// if (action_file.match(regex)) {
//     action_file=action_file.match(regex)[1];
//     console.log('matched');
// } else {
//     console.log('unmatched');
//     return;
// }
// file = path.join(INPUT_PATH, action_file);
// console.log(file);


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

let mysqlExec = require('./util.js');

async function test() {
    var  sql = 'SELECT actions FROM action where project = ? and workflow = ?';
    let params =[event.repository.id, process.env.GITHUB_WORKFLOW];
    let [error, data] = await mysqlExec(sql, params);
    if (error) {
        var actions_obj = data[0].actions;
        //{"actions":"[{\"name\":\"actions/checkout\",\"version\":\"v2\"},{\"name\":\"actions/cache\",\"version\":\"v2\"},{\"name\":\"actions/stale\",\"version\":\"v6.0.1\"}]"}
        for (let obj of actions_obj) {
            console.log(`name:${obj.name}`);
        }
        
        //data = JSON.stringify(data);
        //data = data[0].actions;
        //console.log(JSON.stringify(data[0]));
//         for (let obj of data) {
//             console.log(`name:${obj.name}`);
//         }
    } else {
        console.log('sql执行失败'+data);
    }
}
test();


// let connection =mysql.createConnection({
//     host: "rm-uf60x57re73u05414go.mysql.rds.aliyuncs.com",//连接本地计算机
//     port:3306,//端口
//     user:"ctt",//数据库账号
//     password:"Hello123",//密码
//     database:"action"//连接的数据库名
// });

// //调用connect方法创造连接
// connection.connect((err)=>{//回调函数,如果报错会把err填充上
//     if(err){
//         console.error("连接失败"+err.stack);//打印堆栈信息
//         return;
//     }
//     console.log("连接成功");
// });

// var  sql2 = 'SELECT actions FROM action where project = ? and workflow = ?';
// let params2=[event.repository.id, process.env.GITHUB_WORKFLOW];
// //查
// connection.query(sql2, params2, (err2,result2)=>{
//     if(err2){
//         console.log('[SELECT ERROR] - ',err2.message);
//         return;
//     }
//     if (JSON.stringify(result2) != '{}' && JSON.stringify(result2) != '[]') {
//         console.log("已有配置文件"+typeof(result2));
//         console.log(JSON.stringify(result2));
//         console.log(result2[1].toString());
//         console.log(result2[2].toString());
//         //配置文件与数据库中对比
//         //connection.end();
//         process.exit(0);
//     }
// });

// let sql = "INSERT INTO action(project,workflow,actions,last_modified) VALUES (?,?,?,now())";
// //设置参数
// let params=[event.repository.id, process.env.GITHUB_WORKFLOW, json_data];
// connection.query(sql,params,(err,result)=>{
//     if (err) {
//          console.error("插入失败" + err.message);
//          return;
//     }
//     console.log("新配置文件，插入成功");
// });

// //关闭数据库连接
// connection.end();

// // console.log(event.repository.url);
// // console.log(event);
// // console.log(process.argv);
