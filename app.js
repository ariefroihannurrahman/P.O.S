const express = require('express');
const app = express();
const mysql = require('mysql');
const path = require('path');

app.listen(3000, () => {
    console.log("Server running in port : 3000");
});

app.use(express.static('public'));

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "paw2"
});

// app.get('/',(req,res)=>{
//     pool.query('select * from app.buku', (error,results)=>{
//         if(error){
//             throw error;
//         }
//         res.render('index.ejs', {daftarBuku:results.rows});
//     })
// });


app.get('/',(req, res) => {
    let sql = "SELECT * FROM kasir";
    let query = conn.query(sql, (err, results) => {
      if(err) throw err;
      res.render('manager_kasir.ejs',{
        results: results
      });
    });
  });

  app.get('/tambah-kasir',(req,res)=>{
    res.render('manager_kasir_tambah.ejs');
});

app.post('/tambah', (req,res)=>{

    let data = {
        nama_kasir: req.body.nama_kasir, 
        alamat: req.body.alamat,
        no_telepon : req.body.no_telepon,
        jenis_kelamin : req.body.jenis_kelamin,
        tanggal_bekerja : req.body.tanggal_bekerja,
        kode_kasir : req.body.kode_kasir
    };
  let sql = "INSERT INTO kasir SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
    
});


// con.connect(function(err) {
//     if (err) throw err;
//         con.query("SELECT * FROM kasir", function (err, result, fields) {
//       if (err) throw err;
//       console.log(result);
//     });
// });