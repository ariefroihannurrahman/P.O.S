const express = require('express');
const app = express();
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
const { request } = require('http');
const { response } = require('express');
const async = require('async');

app.listen(3000, () => {
    console.log("Server running in port : 3000");
});

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "pos"
});


app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  loggedin: false,
  laporan_awal:null
}));

let date_time = new Date();
let date1 = ("0" + date_time.getDate()).slice(-2);
let month1 = ("0" + (date_time.getMonth() + 1)).slice(-2);
let year1 = date_time.getFullYear();
let tanggal = year1 + "-" + month1 + "-" + date1;
let tanggal2 =year1+month1+date1;


app.get('/',(req,res)=>{
  if(req.session.loggedin == true){
    res.redirect('/kasir');
  }else{
    res.render('login.ejs');
  }
});

app.post('/auth', function(req,res) {
  let kode = req.body.kode_kasir;
  conn.query('SELECT * FROM karyawan WHERE kode = ?', [kode], function(error, results, fields) {
    if (error) throw error;
      if (results.length > 0) {
          req.session.loggedin = true;
          req.session.dataKasir = results[0];
          res.redirect('/laporan-awal');
      } else {
        res.send('Kode Salah!');
      }			
      res.end();
    });
});

//LAPORAN AWAL

app.get('/laporan-awal', (req,res) => {
  res.render('kasir/laporan-awal.ejs',{
    dataKasir: req.session.dataKasir,
  });
});

app.post('/add-laporan-awal',(req, res) => {
  let data = {
    no_karyawan : req.session.dataKasir.no_karyawan,
    tanggal_laporan : tanggal,
    laporan_awal : req.body.laporan_awal
  };
  session.laporan_awal = req.body.laporan_awal;
  let sql = "INSERT INTO laporan_kasir SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    // res.redirect('/kasir');
    res.redirect('/kasir');
  });
});

app.get('/laporan-akhir', (req,res) => {
  res.render('kasir/laporan-akhir.ejs',{
    lap_awal: session.laporan_awal,
  });
});


app.post('/add-laporan-akhir',(req, res) => {
  let sql = "UPDATE laporan_kasir SET laporan_akhir ='"+req.body.laporan_akhir+"' WHERE no_karyawan="+req.session.dataKasir.no_karyawan+";"
  
  let query = conn.query(sql,(err, results) => {
    if(err) throw err;
    req.session.loggedin = false;
    req.session.dataKasir = null;
    res.redirect('/');
  });
});


//============

app.get('/cari-produk', (req,res) => {
  res.render('kasir/cari-produk.ejs');
});

app.get('/kasir', (req,res) => {
  res.render('kasir/home-kasir.ejs');
});

app.get('/cari-produk', (req,res) => {
  res.render('cari-produk.ejs');
});

//====================
app.get('/owner', (req,res) => {
  res.render('owner/laporan-pemilik.ejs');
});
//====================


//HALAMAN HOME MANAGER
app.get('/manager',(req,res)=>{
    async.parallel([
      function(callback){
        let sql = "select penjualan.no_penjualan, penjualan.kd_penjualan, karyawan.nama_karyawan, penjualan.tanggal_penjualan, penjualan.deskripsi from penjualan INNER JOIN karyawan ON penjualan.no_karyawan = karyawan.no_karyawan;";
        let query = conn.query(sql, (err, results1) => {
          if (err) {
            return callback(err);
          }
          return callback(null, results1);
        });
      },function(callback){
        let sql = "SELECT * FROM karyawan";
        let query = conn.query(sql, (err, results2) => {
          if (err) {
            return callback(err);
          }
          return callback(null, results2);
        });
      },function(callback){
        let sql = "SELECT produk.no_produk, produk.kd_produk, produk.nama_produk, produk.harga, jenis.nama_jenis, kategori.nama_kategori FROM produk INNER JOIN jenis ON produk.no_jenis = jenis.no_jenis INNER JOIN kategori ON produk.no_kategori = kategori.no_kategori";
        let query = conn.query(sql, (err, results3) => {
          if (err) {
            return callback(err);
          }
          return callback(null, results3);
        });
      },function(callback){
        let sql = "SELECT * FROM kategori";
        let query = conn.query(sql, (err, results4) => {
          if (err) {
            return callback(err);
          }
          return callback(null, results4);
        });
      },function(callback){
        let sql = "SELECT * FROM jenis";
        let query = conn.query(sql, (err, results5) => {
          if (err) {
            return callback(err);
          }
          return callback(null, results5);
        });
      }
    ], function(error,callbackResults){
      if(error){
        console.log(error);
      }else{
        res.render('manager/home-manager.ejs',{
          listPenjualan:callbackResults[0],
          listKaryawan:callbackResults[1],
          listProduk: callbackResults[2],
          listKategori: callbackResults[3],
          listJenis: callbackResults[4]
        });
      }
    });
  });

  app.get('/manager', (req,res) => {
    res.render('manager/home-manager.ejs');
  });

// HALAMAN KELOLA  MANAGER

app.get('/karyawan', (req,res) => {
  let sql = "SELECT * FROM karyawan";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.render('manager/kelola-karyawan.ejs',{
      listKasir: results,
    });
  });
});

app.get('/tambah-karyawan', (req,res) => {
  res.render('manager/tambah/tambah-karyawan.ejs');
});


// HALAMAN KELOLA BARANG
app.get('/produk', (req,res) => {
  let sql = "SELECT produk.no_produk, produk.kd_produk, produk.nama_produk, produk.harga, jenis.nama_jenis, kategori.nama_kategori FROM produk INNER JOIN jenis ON produk.no_jenis = jenis.no_jenis INNER JOIN kategori ON produk.no_kategori = kategori.no_kategori";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.render('manager/kelola-produk.ejs',{
      listProduk: results,
    });
  });
});

app.get('/tambah-produk', (req,res) => {
  async.parallel([
    function(callback){
      let sql = "select * from jenis";
      let query = conn.query(sql, (err, results1) => {
        if (err) {
          return callback(err);
        }
        return callback(null, results1);
      });
    },function(callback){
      let sql = "SELECT * FROM kategori";
      let query = conn.query(sql, (err, results2) => {
        if (err) {
          return callback(err);
        }
        return callback(null, results2);
      });
    }
  ], function(error,callbackResults){
    if(error){
      console.log(error);
    }else{
      res.render('manager/tambah/tambah-produk.ejs',{
        listJenis:callbackResults[0],
        listKategori:callbackResults[1]
      });
    }
  });
});



app.get('/edit-produk', (req,res) => {
  res.render('manager/edit/edit-produk.ejs');
});


//HALAMAN KELOLA PENJUALAN

app.get('/penjualan', (req,res) => {
  let sql = "select penjualan.no_penjualan, penjualan.kd_penjualan, karyawan.nama_karyawan, penjualan.tanggal_penjualan, penjualan.deskripsi from penjualan INNER JOIN karyawan ON penjualan.no_karyawan = karyawan.no_karyawan;";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.render('manager/kelola-penjualan.ejs',{
      listPenjualan: results,
    });
  });
});

app.get('/tambah-penjualan', (req,res) => {
  res.render('manager/tambah/tambah-penjualan.ejs');
});


//HALAMAN KELOLA KATEGORI
app.get('/kategori', (req,res) => {
  let sql = "SELECT * FROM kategori";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.render('manager/kelola-kategori.ejs',{
      listKategori: results,
    });
  });
});

app.get('/edit-kategori', (req,res) => {
  res.render('manager/edit/edit-kategori.ejs');
});

app.get('/tambah-kategori', (req,res) => {
  res.render('manager/tambah/tambah-kategori.ejs');
});

app.get('/edit-kategori', (req,res) => {
  res.render('manager/edit/edit-kategori.ejs');
});


//HALAMAN KELOLA JENIS
app.get('/jenis', (req,res) => {
  let sql = "SELECT * FROM jenis";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.render('manager/kelola-jenis.ejs',{
      listJenis: results,
    });
  });
});

app.get('/tambah-jenis', (req,res) => {
  res.render('manager/tambah/tambah-jenis.ejs');
});

app.get('/edit-jenis/:no_jenis', (req,res) => {
  let id = req.params.no_jenis;
  let sql = "SELECT * FROM jenis WHERE no_jenis="+id+"";
  let query = conn.query(sql,(err, results) => {
    if(err) throw err;
    res.render('manager/edit/edit-jenis.ejs',{
      dataJenis: results[0],
    });
  });
});

app.post('/update-jenis/', (req,res)=>{
  let id = req.body.no_jenis;
  let data = req.body.nama_jenis;
  let sql = "UPDATE jenis SET nama_jenis = '"+data+"' WHERE no_jenis= "+id+";"
  let query = conn.query(sql,data,(err, results) => {
    if(err) throw err;
    res.redirect('/jenis');
  });
});

app.post('/edit-jenis/:no_jenis', (req,res) => {
  let id = req.params.no_jenis;
  let sql = "SELECT * FROM jenis WHERE no_jenis="+id+"";
  let query = conn.query(sql,(err, results) => {
    if(err) throw err;
    res.render('manager/edit/edit-jenis.ejs',{
      dataJenis: results[0],
    });
  });
});

app.get('/delete-jenis/:no_jenis', (req,res)=>{
  let id = req.params.no_jenis;
  let sql = "DELETE FROM jenis WHERE no_jenis="+id+"";
  let query = conn.query(sql,(err, results) => {
    if(err) throw err;
    res.redirect('/jenis');
  });
});













// app.post('/add-karyawan',(req, res) => {
//   let data = {
//     no_karyawan: req.body.nama_kasir, 
//     nama_karyawan: req.body.no_hp,
//     nomor_handphone: req.body.alamat_kasir,
//     jenis_kelamin: req.body.kode_kasir,
//     tanggal_rekrut: req.body.kode_kasir,
//     jabatan: req.body.kode_kasir,
//     kode: req.body.kode_kasir,
//     alamat: req.body.kode_kasir
//   };
//   let sql = "INSERT INTO kasir SET ?";
//   let query = conn.query(sql, data,(err, results) => {
//     if(err) throw err;
//     res.redirect('/manager/kasir');
//   });
// });



// app.get('/edit-karyawan', (req,res) => {
//   res.render('manager/edit/edit-karyawan.ejs');
// });

// app.get('/manager/kasir',(req,res)=>{
  
// });


// app.post('/delete-karyawan',(req, res) => {
//   let sql = "DELETE FROM karyawan WHERE id="+req.body.id+"";
//   let query = conn.query(sql, (err, results) => {
//     if(err) throw err;
//       res.redirect('/manager/kasir');
//   });
// });
// app.post('/update-kasir',(req, res) => {
//   let sql = "UPDATE kasir SET nama_kasir='"+req.body.nama_kasir+"', no_hp='"+req.body.no_hp+"', alamat='"+req.body.alamat_kasir+"', kode_kasir='"+req.body.kode_kasir+"' WHERE id="+req.body.id;
//   let query = conn.query(sql, (err, results) => {
//     if(err) throw err;
//     res.redirect('/manager/kasir');
//   });
// });

// //HALAMAN KELOLA SHIFT

// app.get('/manager/shift',(req,res)=>{
//   let sql = "SELECT * FROM shift";
//   let query = conn.query(sql, (err, results) => {
//     if(err) throw err;
//     res.render('manager/manager_shift.ejs',{
//       listShift: results
//     });
//   });
// });

// app.post('/add-shift',(req, res) => {
//   let data = {
//     nama_shift: req.body.nama_shift, 
//     waktu_mulai: req.body.waktu_mulai,
//     waktu_selesai: req.body.waktu_selesai
//   };
//   let sql = "INSERT INTO shift SET ?";
//   let query = conn.query(sql, data,(err, results) => {
//     if(err) throw err;
//     res.redirect('/manager/shift');
//   });
// });

// app.post('/update-shift',(req, res) => {
//   let sql = "UPDATE shift SET nama_shift='"+req.body.nama_shift+"', waktu_mulai='"+req.body.waktu_mulai+"', waktu_selesai='"+req.body.waktu_selesai+"' WHERE id="+req.body.id;
//   let query = conn.query(sql, (err, results) => {
//     if(err) throw err;
//     res.redirect('/manager/shift');
//   });
// });

// app.post('/delete-shift',(req, res) => {
//   let sql = "DELETE FROM shift WHERE id="+req.body.id+"";
//   let query = conn.query(sql, (err, results) => {
//     if(err) throw err;
//       res.redirect('/manager/shift');
//   });
// });

// //HALAMAN KELOLA JADWAL

// app.get('/manager/jadwal',(req,res)=>{
//   async.parallel([
//     function(callback){
//       let sql = "select jadwal.id, jadwal.hari, shift.nama_shift, shift.waktu_mulai, shift.waktu_selesai, kasir.nama_kasir FROM jadwal INNER JOIN shift on jadwal.id_shift = shift.id INNER JOIN kasir ON jadwal.id_kasir = kasir.id;";
//       let query = conn.query(sql, (err, results1) => {
//         if (err) {
//           return callback(err);
//         }
//         return callback(null, results1);
//       });
//     },function(callback){
//       let sql = "SELECT * FROM shift";
//       let query = conn.query(sql, (err, results2) => {
//         if (err) {
//           return callback(err);
//         }
//         return callback(null, results2);
//       });
//     },function(callback){
//       let sql = "SELECT * FROM kasir";
//       let query = conn.query(sql, (err, results3) => {
//         if (err) {
//           return callback(err);
//         }
//         return callback(null, results3);
//       });
//     }
//   ], function(error,callbackResults){
//     if(error){
//       console.log(error);
//     }else{
//       res.render('manager/manager_jadwal.ejs',{
//         listJadwal:callbackResults[0],
//         listShift:callbackResults[1],
//         listKasir: callbackResults[2]
//       });
//     }
//   });
  
// });

// app.get('/get-kasir',(req,res)=>{
//   let sql = "SELECT * FROM kasir";
//   let query = conn.query(sql, (err, results) => {
//     if(err) throw err;
//     listJadwal: results
//   });
// });

// app.post('/add-jadwal',(req, res) => {
//   let data = {
//     nama_shift: req.body.nama_shift, 
//     waktu_mulai: req.body.waktu_mulai,
//     waktu_selesai: req.body.waktu_selesai
//   };
//   let sql = "INSERT INTO jadwal SET ?";
//   let query = conn.query(sql, data,(err, results) => {
//     if(err) throw err;
//     res.redirect('/manager/jadwal');
//   });
// });

// app.post('/update-jadwal',(req, res) => {
//   let sql = "UPDATE jadwal SET nama_shift='"+req.body.nama_shift+"', waktu_mulai='"+req.body.waktu_mulai+"', waktu_selesai='"+req.body.waktu_selesai+"' WHERE id="+req.body.id;
//   let query = conn.query(sql, (err, results) => {
//     if(err) throw err;
//     res.redirect('/manager/jadwal');
//   });
// });

// app.post('/delete-jadwal',(req, res) => {
//   let sql = "DELETE FROM jadwal WHERE id="+req.body.id+"";
//   let query = conn.query(sql, (err, results) => {
//     if(err) throw err;
//       res.redirect('/manager/jadwal');
//   });
// });
