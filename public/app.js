const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const sessionStorage = require('./session.js')

app.use(bodyParser.urlencoded({ extended: true }));

app.use(sessionStorage)

const router = require('./router.js')(app)

app.use(express.static('template'))
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile)

const server = app.listen(8000, () => {
    console.log("Express server has started on port 8000")
})