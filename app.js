const express = require('express');
const dataAccess = require('dataAccess');
const Command = dataAccess.command;
const Executor = dataAccess.executor;
const app = express();
const cryptoUtil = require('./cryptoUtil');
const dbEnv = "local";
const fs = require('fs');
const conf = require('./conf');
const npath = require('path');
app.use(express.json());
app.use(express.urlencoded({extended: false}));
dataAccess.setPoolConfig(require('./mysql'));
app.get('/version', (req, res) => {
    console.log(req.query);
    let gametag = req.query['gametag'];
    let cv = req.query['cv'];
    let sql = new Command('select * from version where gameTag = ? and version > ? ' +
        'and online = 1 order by version desc limit 0,1', [gametag, cv]);
    Executor.query(dbEnv, sql, (e, r) => {
        if (!e) {
            if (r.length > 0) {
                let serverV = r[0];
                res.send({code: 200, data: {serverVersion: serverV.version, url: serverV['resourceUrl']}})
            } else {
                res.send({code: 200})
            }
        } else {
            res.send({code: 500})
        }
    })
});

app.get('/clientConf', (req, res) => {
    let gameTag = req.query['gametag'];
    let path = conf[`${gameTag}_confPath`];
    console.log(path);
    fs.readdir(path, function (err, files) {
        if (err) {
            console.warn(err)
        }
        else {
            let conf = {};
            for(let i = 0;i<files.length;i++){
                let f = files[i];
                let ext = npath.extname(f);
                if(npath.extname(f) === ".json"){
                    let baseName = npath.basename(f, ext);
                    let fullPath = `${path}/${f}`;
                    conf[baseName] = require(fullPath);
                }
            }
            res.send({code: 200,data:conf})
        }
    });
});


const sec = `232198a88ecf39e6632cc893dfc7d232b959f5d9d95df84bbbc4e11162207be0`;
const tv = {
    v: "1",
    tag: 'zq',
    url: 'xxxx'
};
// console.log(cryptoUtil.toSecret(JSON.stringify(tv),sec));

app.post('/updateVersion', (req, res) => {
    let version = req.body["v"];
    let tag = req.body["tag"];
    let url = req.body["url"];
    let sql = new Command('insert into version(gameTag, version, resourceUrl,updateAt) values(?,?,?,?)', [tag, version, url, ~~(new Date().getTime())]);
    Executor.query(dbEnv, sql, (e, r) => {
        if (e) {
            console.log(e);
            res.send({code: 500})
        } else {
            res.send({code: 200})
        }
    })
});

app.listen(8989);