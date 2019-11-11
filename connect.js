const mysql = require('mysql')
const info = require('./info.js');

module.exports = function() {
    return {
        init: function() {
            return mysql.createConnection(info);
        },
        open: function (con) {
            con.connect(function (err) {
                if (err) {
                    console.error('mysql connection error : ' + err);
                } else {
                    console.info('mysql is connected successfully.');
                }
            })
        }
    }
};