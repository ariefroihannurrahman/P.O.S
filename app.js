const express = require('express');
const app = express();
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
const { request } = require('http');
const e = require('express');

app.listen(3000, () => {
    console.log("Server running in port : 3000");
});

app.use(express.static('public'));

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "pos"
});


//login

app.get('/', (req,res) => {
  res.render('pages/login.ejs');
});

app.get('/home-manager', (req,res) => {
  res.render('pages/manager/home-manager.ejs');
});

app.get('/laporan-awal', (req,res) => {
  res.render('pages/laporan-awal.ejs');
});

app.get('/laporan-akhir', (req,res) => {
  res.render('pages/laporan-akhir.ejs');
});

app.get('/kasir', (req,res) => {
  res.render('pages/home-kasir.ejs');
});

app.get('/cari-produk', (req,res) => {
  res.render('pages/cari-produk.ejs');
});

app.get('/laporan-pemilik', (req,res) => {
  res.render('pages/owner/laporan-pemilik.ejs');
});

// //HALAMAN LOGIN KASIR

// app.use(session({
// 	secret: 'secret',
// 	resave: true,
// 	saveUninitialized: true,
//   loggedin: false
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.get('/',(req,res)=>{
//   if(req.session.loggedin){
//     res.redirect('/transaksi');
//   }else{
//     res.render('transaksi/login.ejs');
//   }
    
// });


// app.post('/auth', function(req,res) {

// 	let kode = req.body.kode_kasir;

// 	conn.query('SELECT * FROM kasir WHERE kode_kasir = ?', [kode], function(error, results, fields) {
// 		if (error) throw error;
//       if (results.length > 0) {
//           req.session.loggedin = true;
//           req.session.dataKasir = results[0];
//           // req.session.nama_kasir = results[0].nama_kasir;
//           res.redirect('/transaksi');
//       } else {
// 				res.send('Kode Salah!');
// 			}			
// 			res.end();
// 		});
// });


// app.get('/transaksi', function(req,res) {
// 	if (req.session.loggedin) {
//     res.render('transaksi/transaksi.ejs',{
//       dataKasir: req.session.dataKasir
//     });
//     // res.render('transaksi/transaksi.ejs');
// 	} else {
// 		res.redirect('/');
// 	}
// });

// app.get('/logout', function(req,res) {
// 	req.session.loggedin = false;
//   req.session.nama_kasir = null;
//   res.redirect('/');
// });


// //HALAMAN KELOLA KASIR MANAGER

// app.get('/manager/kasir',(req,res)=>{
//   let sql = "SELECT * FROM kasir";
//   let query = conn.query(sql, (err, results) => {
//     if(err) throw err;
//     res.render('manager/manager_kasir.ejs',{
//       listKasir: results
//     });
//   });
// });

// app.post('/add-kasir',(req, res) => {
//   let data = {
//     nama_kasir: req.body.nama_kasir, 
//     no_hp: req.body.no_hp,
//     alamat: req.body.alamat_kasir,
//     kode_kasir: req.body.kode_kasir
//   };
//   let sql = "INSERT INTO kasir SET ?";
//   let query = conn.query(sql, data,(err, results) => {
//     if(err) throw err;
//     res.redirect('/manager/kasir');
//   });
// });

// app.post('/update-kasir',(req, res) => {
//   let sql = "UPDATE kasir SET nama_kasir='"+req.body.nama_kasir+"', no_hp='"+req.body.no_hp+"', alamat='"+req.body.alamat_kasir+"', kode_kasir='"+req.body.kode_kasir+"' WHERE id="+req.body.id;
//   let query = conn.query(sql, (err, results) => {
//     if(err) throw err;
//     res.redirect('/manager/kasir');
//   });
// });

// app.post('/delete-kasir',(req, res) => {
//   let sql = "DELETE FROM kasir WHERE id="+req.body.id+"";
//   let query = conn.query(sql, (err, results) => {
//     if(err) throw err;
//       res.redirect('/manager/kasir');
//   });
// });