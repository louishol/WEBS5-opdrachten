var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    var db = req.db;
    db.collection('users').find().toArray(function (err, users) {
        res.json({users : users });
    });
});

router.post('/', function(req, res) {
    var db = req.db;
    db.collection('users').insert(req.body, function(err, result){
        if (err)        {  res.sendStatus(500); }
        else            {  res.sendStatus(201); }
        res.end();
    });
});

router.put('/', function(req, res) {
    var db = req.db;
    db.collection('users').updateById(req.body.id, {$set:{name:req.body.name}}, function(err, result){
        if (err)        {  res.sendStatus(304); }
        else            {  res.sendStatus(200); }
    });
});

router.delete('/', function(req, res) {
    var db = req.db;
    db.collection('users').removeById(req.body.id, function(err, result) {
        if (err)        {  res.sendStatus(500); }
        else            {  res.sendStatus(200); }
    });
});

module.exports = router;