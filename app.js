const express = require('express');
const dataAccess = require('dataAccess');
const Command  = dataAccess.command;
const Executor = dataAccess.executor;
const app = express();
const cryptoUtil = require('./cryptoUtil');
const dbEnv = "local";
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
dataAccess.setPoolConfig(require('./mysql'));
app.get('/version', (req,res) => {
    console.log(req.query);
    let gametag = req.query['gametag'];
    let cv = req.query['cv'];
    let sql = new Command('select * from version where gameTag = ? and version > ? ' +
        'and online = 1 order by version desc limit 0,1', [gametag, cv]);
    Executor.query(dbEnv, sql, (e,r)=>{
        if(!e){
            if(r.length > 0){
                let serverV = r[0];
                res.send({code:200,data:{serverVersion:serverV.version, url:serverV['resourceUrl']}})
            }
            else{
                res.send({code:200})
            }
        }
        else{
            res.send({code:500})
        }
    })
});

const sec = `232198a88ecf39e6632cc893dfc7d232b959f5d9d95df84bbbc4e11162207be0`;
const tv = {
    v:"1",
    tag:'zq',
    url:'xxxx'
};
console.log(cryptoUtil.toSecret(JSON.stringify(tv),sec));

app.post('/updateVersion',(req,res) =>{
    let version = req.body["v"];
    let tag = req.body["tag"];
    let url = req.body["url"];
    let sql = new Command('insert into version(gameTag, version, resourceUrl,updateAt) values(?,?,?,?)',[tag, version, url, ~~(new Date().getTime())]);
    Executor.query(dbEnv, sql,(e,r)=>{
        if(e){
            console.log(e);
            res.send({code:500})
        }
        else{
            res.send({code:200})
        }
    })
});

app.listen(8989);