const cp = require("child_process");
cp.execSync("npm install mysql");
var mysql = require('mysql');

function createConnection() {
    var connection = mysql.createConnection({
    host: "rm-uf60x57re73u05414go.mysql.rds.aliyuncs.com",//连接本地计算机
    port:3306,//端口
    user:"ctt",//数据库账号
    password:"Hello123",//密码
    database:"action"//连接的数据库名
    });
    return connection;
}
module.exports.createConnection = createConnection;
