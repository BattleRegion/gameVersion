const express = require('express');
const dataAccess = require('dataAccess');
const Command  = dataAccess.command;
const Executor = dataAccess.executor;
const app = express();
const dbEnv = "local";

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

app.listen(8989);