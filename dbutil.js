const cp = require("child_process");
cp.execSync("npm install mysql");
var mysql = require('mysql');

function createConnection() {
    var connection = mysql.createConnection({
        host: '127.0.0.1',
        database: 'school',
        user: 'root',
        password: '123456'
    });
    return connection;
}
module.exports.createConnection = createConnection;
