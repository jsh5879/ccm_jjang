const mysql = require('./connect.js')();
const connection = mysql.init();
mysql.open(connection);

var cid, hid;

function callMainPage(req, res, sessionData) {
    // insertData();
    if ( !req.session.login ) {
        res.redirect('/LoginPage');
    } else {
        if ( req.session.data.role == "학생" ) {
            let sendData = JSON.parse(JSON.stringify(sessionData));
            sendData.clist = [];
            const query = `SELECT * FROM applyinfo AS info JOIN course AS c WHERE info.cid = c.cid AND uid = "${req.session.data.id}"; `;
            const search = "SELECT DISTINCT name FROM course;";
            connection.query(query + search, (err, result) => {
                if ( result[0] !== undefined ) {
                    sendData.clist = result[0];
                }
                sendData.search = result[1].map( e => e.name );
                res.render('student_main', sendData);
            })
        } else {
            let sendData = JSON.parse(JSON.stringify(sessionData));
            sendData.clist = [];
            const query = `SELECT * FROM course WHERE professor = "${req.session.data.name}"; `;
            const search = "SELECT DISTINCT name FROM course;";
            connection.query(query + search, (err, result) => {
                if ( result[0] !== undefined ) {
                    sendData.clist = result[0];
                }
                sendData.search = result[1].map( e => e.name );
                res.render('prof_main', sendData);
            })
        }
    }
}

const route = (app) => {
    app.get('/', (req, res) => {
        res.redirect('/Main');
    });
    app.get('/LoginPage', (req, res) => {
        res.render('login', { notify: false, message: null })
    })
    app.get('/RegPage', (req, res) => {
        res.render('register', { notify: false, message: null })
    })
    app.get('/Main', (req, res) => {
        callMainPage(req, res, req.session.data);
    })
    app.get('/Logout', (req, res) => {
        req.session.login = false;
        res.redirect('/LoginPage');
    })
    app.get('/Search', (req, res) => {
        let sendData = JSON.parse(JSON.stringify(req.session.data));
        const keyword = req.query.key;
        const query = `SELECT * FROM course WHERE name LIKE '%${keyword}%';`;
        const search = "SELECT DISTINCT name FROM course;";
        connection.query(query + search, function (err, result) {
            sendData.slist = [];
            if ( result[0] !== undefined )
                sendData.slist = result[0];
            sendData.search = result[1].map( e => e.name );
            res.render('search', sendData);
        })
    })
    app.get('/CoursePage', (req, res) => {
        let sendData = JSON.parse(JSON.stringify(req.session.data));
        if ( req.query.cid )
            cid = req.query.cid;
        const query = `SELECT * FROM course WHERE cid = '${cid}';`;
        const search = "SELECT DISTINCT name FROM course;";
        const homework = `SELECT * FROM homework WHERE cid = '${cid}';`;
        const apply = `SELECT uid FROM applyinfo WHERE cid = '${cid}';`;
        connection.query(query + search + homework + apply, function (err, result) {
            sendData.cinfo = result[0][0];
            sendData.search = result[1].map( e => e.name );
            sendData.hlist = result[2];
            const attendant = result[3].map( e => e.uid.toString() );
            sendData.attendant = attendant.length;
            if ( req.session.data.role == "교수" ) {
                res.render('prof_course', sendData);
            } else {
                if ( attendant.includes(req.session.data.id) ) {
                    res.render('student_course', sendData);
                } else {
                    res.render('apply_course', sendData);
                }
            }
        })
    })
    app.get('/MakeCoursePage', (req, res) => {
        let sendData = JSON.parse(JSON.stringify(req.session.data));
        const query = "SELECT DISTINCT name FROM course;";
        connection.query(query, (err, result) => {
            sendData.search = result.map( e => e.name );
            res.render('makecoursepage', sendData);
        })
    })
    app.get('/Score', (req, res) => {
        res.redirect('/CoursePage');
    })
    app.get('/AddHomeworkPage', (req, res) => {
        let sendData = JSON.parse(JSON.stringify(req.session.data));
        const query = `SELECT * FROM course WHERE cid = '${cid}';`;
        const search = "SELECT DISTINCT name FROM course;";
        connection.query(query + search, (err, result) => {
            sendData.cinfo = result[0][0];
            sendData.search = result[1].map( e => e.name );
            res.render('addhomeworkpage', sendData);
        })
    })
    app.get('/HomeworkPage', (req, res) => {
        hid = req.query.hid;
        let sendData = JSON.parse(JSON.stringify(req.session.data));
        const query = `SELECT * FROM course WHERE cid = '${cid}';`;
        const search = "SELECT DISTINCT name FROM course;";
        connection.query(query + search, (err, result) => {
            sendData.cinfo = result[0][0];
            sendData.search = result[1].map( e => e.name );
            res.render('editors', sendData);
        })
    })
    app.post('/Apply', (req, res) => {
        const query = `INSERT INTO applyinfo(cid, uid) VALUES ('${cid}', '${req.session.data.id}');`;
        connection.query(query, function (err, result) {
            if ( !err )
                res.render('notify', { success: true, message: "수강 신청 되었습니다.", move: "/Main" });
            else
                res.render('notify', { success: false, message: "다시 시도해 주세요.", move: "/Main" });
        })
    })
    app.post('/AddScore', (req, res) => {
        const score = req.body.score;
        const query = `INSERT INTO score(uid, hid, score, date) VALUES ('${req.session.data.id}', '${hid}', ${score}, NOW());`;
        const update = `UPDATE homework SET count = (SELECT COUNT(DISTINCT uid) FROM score WHERE hid = '${hid}') WHERE hid = ${hid};`;
        connection.query(query + update, function (err, result) {
            if ( !err )
                res.render('notify', { success: true, message: "점수가 등록되었습니다.", move: "/Score" });
            else
                res.render('notify', { success: true, message: "다시 시도해 주세요.", move: "/Score" });
        })
    })
    app.post('/AddHomework', (req, res) => {
        const hname = req.body.hname, deadline = req.body.deadline;
        const query = `INSERT INTO homework(cid, hname, deadline) VALUES ('${cid}', '${hname}', '${deadline}');`;
        connection.query(query, function (err, result) {
            if ( !err )
                res.render('notify', { success: true, message: "과제가 등록 되었습니다.", move: "/CoursePage" });
            else
                res.render('notify', { success: false, message: "다시 시도해 주세요.", move: "/CoursePage" });
        })
    })
    app.post('/MakeCourse', (req, res) => {
        const cname = req.body.cname, classnum = req.body.class, professor = req.body.professor;
        const query = `INSERT INTO course(name, class, professor) VALUES ('${cname}', '${classnum}', '${professor}');`
        connection.query(query, function (err, result) {
            if ( !err )
                res.render('notify', { success: true, message: "강의가 등록 되었습니다.", move: "/Main" });
            else
                res.render('notify', { success: false, message: "다시 시도해 주세요.", move: "/Main" });
        })
    })
    app.post('/LoginCheck', (req, res) => {
        const id = req.body.id, password = req.body.password;
        const query = `SELECT * FROM account WHERE id = '${id}'`;
        connection.query(query, function (err, result) {
            if ( result[0] == undefined ) {
                console.log("Not Found ID");
                req.session.login = false;
            } else if ( result[0].password === password ) {
                console.log("Login Complete");
                req.session.data = result[0];
                req.session.login = true;
            } else {
                console.log("Login Failed");
                req.session.login = false;
            }
            res.redirect('/Main');
        })
    })
    app.post('/REG', (req, res) => {
        const id = req.body.id, name = req.body.name, password = req.body.password, dep = req.body.department, prof = req.body.prof
        let role = "학생"
        if ( prof ) role = "교수"
        const query = `INSERT INTO account VALUES ('${id}', '${password}', '${name}', '${role}', '${dep}');`
        connection.query(query, function (err, result) {
            if ( !err )
                res.render('login', { notify: true, message: "가입이 완료 되었습니다." });
            else
                res.render('register', { notify: true, message: "가입 실패. 다시 시도해주세요." });
        })
    })
}

function insertData() {
    let text = `시스템소프트웨어	59	권준호
시스템소프트웨어	60	안성용
시스템소프트웨어	61	안성용
웹응용프로그래밍	59	권혁철
웹응용프로그래밍	60	권혁철
플랫폼기반프로그래밍	59	채흥석
플랫폼기반프로그래밍	60	탁성우
플랫폼기반프로그래밍	61	송길태
플랫폼기반프로그래밍	62	감진규
플랫폼기반프로그래밍	63	문정욱
창의프로젝트	59	백윤주
자료구조	59	홍봉희
자료구조	60	조환규
자료구조	61	이기준
자료구조	62	이도훈
이산수학(II)	59	김민환
이산수학(II)	60	김민환
이산수학(II)	61	김호원
확률통계	59	김종덕
확률통계	60	탁성우
확률통계	61	송길태
논리회로설계및실험	1	김호원
논리회로설계및실험	2	김호원
논리회로설계및실험	3	양세양
논리회로설계및실험	4	양세양
컴퓨터그래픽스	60	이도훈
컴파일러	59	우균
데이터베이스	59	이기준
데이터베이스	60	권준호
임베디드시스템	59	정상화
임베디드시스템	60	백윤주
컴퓨터네트워크	59	탁성우
컴퓨터네트워크	60	유영환
소프트웨어공학	59	염근혁
소프트웨어공학	60	채흥석
임베디드시스템설계및실험	1	정상화
임베디드시스템설계및실험	2	정상화
임베디드시스템설계및실험	3	백윤주
임베디드시스템설계및실험	4	백윤주
멀티미디어처리	59	김정구
지능형시스템	59	차의영
데이터마이닝	59	류광렬
사물인터넷	59	김호원`;

    let arr = text.split("\n").map( e => e.split("\t") );
    const query = arr.reduce( (pre, e) => {
        let name = e[0], classnum = e[1], professor = e[2];
        let t = "";
        for ( let i = 0; i < 3-classnum.length; i++ ) {
            t += "0";
        }
        classnum = t + classnum;
        const q = `INSERT INTO course(name, class, professor) VALUES ('${name}', '${classnum}', '${professor}');`;
        return pre + q;
    }, "");
    console.log(query.split(";"));
    connection.query(query, function (err, result) {
        console.log(result);
    })
}

module.exports = route