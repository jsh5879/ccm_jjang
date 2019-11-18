#  Code Indent Checker
* Coding Competencies Manager with Indent Checking
* [오픈소스SW개발 경진대회](https://user-images.githubusercontent.com/26873983/68831018-aba73080-06f0-11ea-82c7-1a93f8d2de46.jpg)

## Environment
  - Ubuntu    `18.04 LTS`
  - NodeJs    `8.10.0`
  - MySQL     `5.7.27`

## How to Start
To install the required modules, use this command :
```
npm install
```
After Installation is completed, you can open service by using this command
```
npm start
```
or
```
node app
```

## Notice
* Make file `public/info.js` for MySQL connection.
```javascript
module.exports = {
    host: 'your_sql_ip',
    port: 'your_port_num',
    user: 'your_id',
    password: 'your_passwd',
    database: 'your_database_name',
    multipleStatements: true
}
```

* Server environment should be able to use the `diff` and `astyle` commands
    > In code editor page, it use shell command `diff` and `astyle`
    * `diff` : Linux/Ubuntu OS
    * `astyle` : install [Artistic Style](http://astyle.sourceforge.net)

## License
* MIT License

## Library
* [CodeMirror](http://codemirror.net) [(Git)](https://github.com/codemirror/CodeMirror)
* [Artistic Style](http://astyle.sourceforge.net)

## Contact Us
E-mail : jsh5869a@naver.com
