//需求：封装一个功能模块来操作mysql数据库//第二步：引入mysql包
//引入mysql包
const mysql = require('mysql');
//创建mysql数据库连接：
const mysqlObj = mysql.createConnection({ host: "rm-uf60x57re73u05414go.mysql.rds.aliyuncs.com", port: 3306, user: "ctt", password: "Hello123", database: "action" });

//连接mysql数据库：
mysqlObj.connect();

//执行sql语句：
function exec(sql, params) {
    return new Promise((resolve, reject) => {
        //执行sql语句：
        mysqlObj.query(sql, params, (err, data) => {
            //需求：返回data
            if (err) { //失败
                resolve([false, 'sql语句错误']);
            } else { //成功
                resolve([true, data]);
            }
        });
    });
}


module.exports = exec;
connection.end();
