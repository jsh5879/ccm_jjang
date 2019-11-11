const options = require('./info.js');
const session = require('express-session');              
const MySQLStore = require('express-mysql-session')(session);    

const sessionStorage = new MySQLStore(options);

module.exports = session({
    secret: "1q2w3e$R",
    resave: false,
    saveUninitialized: true,
    store: sessionStorage
})