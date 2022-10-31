const express = require('express');
const app = express();
const mysql = require('mysql');
const path = require('path');

app.listen(3000, () => {
    console.log("Server running in port : 3000");
});

app.use(express.urlencoded({extended:false}));

app.use(express.static('public'));

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "pos"
});

app.get('/kasir',(req,res)=>{
  let sql = "SELECT * FROM kasir";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.render('manager_kasir.ejs',{
      listKasir: results
    });
  });
});

app.post('/add-kasir',(req, res) => {
  let data = {
    nama_kasir: req.body.nama_kasir, 
    no_hp: req.body.no_hp,
    alamat: req.body.alamat_kasir,
    kode_kasir: req.body.kode_kasir
  };
  let sql = "INSERT INTO kasir SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/kasir');
  });
});

app.post('/update-kasir',(req, res) => {
  let sql = "UPDATE kasir SET nama_kasir='"+req.body.nama_kasir+"', no_hp='"+req.body.no_hp+"', alamat='"+req.body.alamat_kasir+"', kode_kasir='"+req.body.kode_kasir+"' WHERE id="+req.body.id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.redirect('/kasir');
  });
});

app.post('/delete-kasir',(req, res) => {
  let sql = "DELETE FROM kasir WHERE id="+req.body.id+"";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/kasir');
  });
});