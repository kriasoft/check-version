//需求：封装一个功能模块来操作mysql数据库//第二步：引入mysql包
//引入mysql包
const mysql = require('mysql');
//创建mysql数据库连接：
let mysqlObj =mysql.createConnection({
    host: "rm-uf60x57re73u05414go.mysql.rds.aliyuncs.com",//连接本地计算机
    port:3306,//端口
    user:"ctt",//数据库账号
    password:"Hello123",//密码
    database:"action"//连接的数据库名
});

//连接mysql数据库：
mysqlObj.connect();

//执行sql语句：
function exec(sql, params) {
    return new Promise((resolve, reject) => {
        //执行sql语句：
        mysqlObj.query(sql, params, (err, data) => {
            //需求：返回data
            if (err) { //失败
                console.log('[SELECT ERROR] - ',err.message);
                resolve([false, 'sql语句错误']);
            } else { //成功
                resolve([true, data]);
            }
        });
    });
}

module.exports = exec;
mysqlObj.end();
