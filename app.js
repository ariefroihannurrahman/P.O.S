const express = require('express');
const app = express();
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
const { request, get } = require('http');
const { response } = require('express');
const async = require('async');

app.listen(3000, () => {
    console.log("Server running in port : 3000");
});

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  laporan_awal:null,
  id_session: null
}));


let date_time = new Date();
let date1 = ("0" + date_time.getDate()).slice(-2);
let month1 = ("0" + (date_time.getMonth() + 1)).slice(-2);
let year1 = date_time.getFullYear();
let tanggal = year1 + "-" + month1 + "-" + date1;
let tanggal2 =year1+month1+date1;


//===========================================================//
//===================== /SETTING ============================//
//===========================================================//


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
          req.session.id_session = year1+""+month1+""+date1+""+results[0].id_karyawan;
          res.redirect('/laporan-awal');
      } else {
        res.send('Kode Salah!');
      }			
      res.end();
    });
});

//===========================================================//
//===================== /LOGIN AUTH ============================//
//===========================================================//

app.get('/laporan-awal', (req,res) => {
  res.render('kasir/laporan-awal.ejs',{
    dataKasir: req.session.dataKasir,
  });
});

app.post('/add-laporan-awal',(req, res) => {
  let data = {
    id_laporan : req.session.id_session,
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
  let sql = "UPDATE laporan_kasir SET laporan_akhir ='"+req.body.laporan_akhir+"' WHERE id_laporan="+req.session.id_session+";"
  
  let query = conn.query(sql,(err, results) => {
    if(err) throw err;
    req.session.loggedin = false;
    req.session.dataKasir = null;
    req.session.id_session = null;
    res.redirect('/');
  });
});


//===========================================================//
//===================== /Laporan Laci ============================//
//===========================================================//


app.get('/kasir', (req,res) => {
  var query = 'SELECT produk.kd_produk, produk.nama_produk, jenis.nama_jenis, kategori.nama_kategori, produk.harga from produk INNER JOIN jenis ON produk.id_jenis = jenis.id_jenis INNER JOIN kategori ON produk.id_kategori = kategori.id_kategori;';
  conn.query(query, function(err, data){
		if(err) throw err;
    res.render('kasir/home-kasir.ejs',{
      listProduk: data,
    });
	}); 
});

app.post("/get-produk-kode", function(request, response, next){
	var kode = request.body.kode;
	var query = `SELECT * FROM produk WHERE kd_produk = "${kode}"`;
	conn.query(query, function(error, data){
		response.json(data[0]);
	});
});

app.post("/save-item", function(request, response, next){
	var idt = request.body.id_transaksi;
	var idp = request.body.id_produk;
	var kuantitas = request.body.kuantitas;
	var subtotal = request.body.subtotal;

	var query = `INSERT INTO detailtransaksi (id_detail, id_transaksi, id_produk, kuantitas, subtotal) VALUES ("", "${idt}", "${idp}", "${kuantitas}", "${subtotal}")`;
	conn.query(query, function(error, data){
		console.log("Sukses Detail Transaksi");
		
	});
});

app.post("/get-item-list", function(request, response, next){
	var idt = request.body.id_transaksi;
	var query = `select detailtransaksi.id_detail, produk.nama_produk, produk.harga, detailtransaksi.kuantitas, detailtransaksi.subtotal from detailtransaksi INNER JOIN produk ON detailtransaksi.id_produk = produk.id_produk WHERE id_transaksi = "${idt}"`;
	conn.query(query, function(error, data){
		response.json(data);
	});
});

app.post("/save-penjualan", function(request, response, next){
	var idp = request.body.id_penjualan;
	var idk = request.body.id_karyawan;
	var tp = request.body.tanggal_penjualan;
	var total = request.body.total_transaksi;
	var bayar = request.body.bayar;
	var kembali = request.body.kembali;

	var query = `INSERT INTO transaksi (id_penjualan, id_karyawan, tanggal_penjualan, total_transaksi, bayar, kembali) VALUES ("${idp}", "${idk}", "${tp}", "${total}", "${bayar}", "${kembali}")`;
	conn.query(query, function(error, data){
		console.log("Sukses Transaksi");
	});

  res.redirect('/kasir');
});

app.post('/delete-item/', (req,res)=>{
  let id = req.body.id;
  console.log(id);
  let sql = "DELETE FROM detailtransaksi WHERE id_detail="+id+"";
  let query = conn.query(sql,(err, results) => {
    if(err) throw err;
    
  });
});


//===========================================================//
//===================== /KASIR UTAMA ============================//
//===========================================================//




app.get('/cari-produk', (req,res) => {
  res.render('kasir/cari-produk.ejs');
});


app.get('/cari-produk', (req,res) => {
  res.render('cari-produk.ejs');
});

//====================
// app.get('/owner', (req, res)=>{
//   res.render('owner/laporan-pemilik.ejs')
// });

app.get('/owner', (req, res) => {
  let sql = "select penjualan.no_penjualan, penjualan.kd_penjualan, karyawan.nama_karyawan, penjualan.tanggal_penjualan, penjualan.deskripsi from penjualan INNER JOIN karyawan ON penjualan.no_karyawan = karyawan.no_karyawan;";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.render('owner/laporan-pemilik.ejs',{
      listOwner: results,
    });
  });
})

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

// HALAMAN KELOLA KARYAWAN

app.get('/karyawan', (req,res) => {
  let sql = "SELECT * FROM karyawan ORDER BY id_karyawan ASC";
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

app.post('/add-karyawan',(req, res) => {
  let {
    id_karyawan,
    nama_karyawan,
    nomor_handphone,
    jenis_kelamin,
    tanggal_rekrut,
    kode,
    alamat
  } = req.body;
  let sql = `INSERT INTO karyawan (no_karyawan, id_karyawan, nama_karyawan, gambar_karyawan, nomor_handphone, jenis_kelamin, tanggal_rekrut, jabatan, kode, alamat) VALUES (NULL, '${id_karyawan}', '${nama_karyawan}', NULL, '${nomor_handphone}', '${jenis_kelamin}', '${tanggal_rekrut}', 'kasir', '${kode}', '${alamat}');`;
  let query = conn.query(sql,(err, results) => {
    if(err) throw err;
    res.redirect('/karyawan');
  });
});

app.get('/edit-karyawan/:no_karyawan', (req,res) => {
  let id = req.params.no_karyawan;
  let sql = "SELECT * FROM karyawan WHERE no_karyawan="+id+"";
  let query = conn.query(sql,(err, results) => {
    if(err) throw err;
    res.render('manager/edit/edit-karyawan.ejs',{
      dataKaryawan: results[0],
    });
  });
});

app.post('/update-karyawan/', (req,res)=>{
  let {
    no_karyawan,
    nama_karyawan,
    nomor_handphone,
    tanggal_rekrut,
    jenis_kelamin,
    alamat
  } = req.body;
  let sql = "UPDATE karyawan SET nama_karyawan = '"+ nama_karyawan +"', nomor_handphone = '"+ nomor_handphone +"', tanggal_rekrut = '"+ tanggal_rekrut.toLocaleString().split(",")[0] +"', jenis_kelamin = '"+ jenis_kelamin +"', alamat = '"+ alamat +"' WHERE no_karyawan= '"+ no_karyawan +"';";
  let query = conn.query(sql,(err, results) => {
    if(err) throw err;
    res.redirect('/karyawan');
  });
});

app.get('/delete-karyawan/:no_karyawan', (req,res)=>{
  let id = req.params.no_karyawan;
  let sql = "DELETE FROM karyawan WHERE no_karyawan="+id+"";
  let query = conn.query(sql,(err, results) => {
    if(err) throw err;
    res.redirect('/karyawan');
  });
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

app.post('/add-produk',(req, res) => {
  let {
    kd_produk,
    nama_produk,
    no_jenis,
    no_kategori,
    harga
  } = req.body;

  session.laporan_awal = req.body.laporan_awal;
  let sql = `INSERT INTO produk (no_produk, kd_produk, nama_produk, gambar_produk, no_jenis, no_kategori, harga) VALUES (NULL, '${kd_produk}', '${nama_produk}', null, '${no_jenis}', '${no_kategori}', '${harga}');`;
  let query = conn.query(sql,(err, results) => {
    if(err) throw err;
    // res.redirect('/kasir');
    res.redirect('/produk');
  });
});

app.get('/edit-produk/:no_produk', (req,res) => {
  async.parallel([
    function(callback){
      let id = req.params.no_produk;
      let sql = "SELECT * FROM produk WHERE no_produk="+id+"";
      let query = conn.query(sql,(err, results) => {
        if (err) {
          return callback(err);
        }
        return callback(null, results);
      });
    },function(callback){
      let sql = "SELECT * FROM jenis";
      let query = conn.query(sql, (err, results2) => {
        if (err) {
          return callback(err);
        }
        return callback(null, results2);
      });
    },function(callback){
      let sql = "SELECT * FROM kategori";
      let query = conn.query(sql, (err, results3) => {
        if (err) {
          return callback(err);
        }
        return callback(null, results3);
      });
    }
  ], function(error,callbackResults){
    if(error){
      console.log(error);
    }else{
      res.render('manager/edit/edit-produk.ejs',{
        dataProduk:callbackResults[0],
        listJenis:callbackResults[1],
        listKategori:callbackResults[2],
      });
    }
  });
});

app.post('/update-produk/', (req,res)=>{
  let { 
    no_produk,
    kd_produk,
    nama_produk,
    no_jenis,
    no_kategori,
    harga 
    } = req.body;

  let sql = "UPDATE produk SET kd_produk = '"+ kd_produk +"', nama_produk = '"+ nama_produk +"', no_jenis = '"+no_jenis+"', no_kategori = '"+no_kategori+"', harga = '"+ harga +"' WHERE no_produk= "+no_produk+";";
  let query = conn.query(sql,(err, results) => {
    if(err) throw err;
    res.redirect('/produk');
  });
});

app.get('/delete-produk/:no_produk', (req,res)=>{
  let id = req.params.no_produk;
  let sql = "DELETE FROM produk WHERE no_produk="+ id +";";
  let query = conn.query(sql,(err, results) => {
    if(err) throw err;
    res.redirect('/produk');
  });
});


//HALAMAN KELOLA PENJUALAN

app.get('/penjualan', (req,res) => {
  // let sql = "select penjualan.no_penjualan, penjualan.kd_penjualan, karyawan.nama_karyawan, penjualan.tanggal_penjualan, penjualan.deskripsi from penjualan INNER JOIN karyawan ON penjualan.no_karyawan = karyawan.no_karyawan;";
  // let query = conn.query(sql, (err, results) => {
  //   if(err) throw err;
  //   res.render('manager/kelola-penjualan.ejs',{
  //     listPenjualan: results,
  //   });
  // });

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
      let sql = `SELECT * from detailpenjualan;`;
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
      res.render('manager/kelola-penjualan.ejs',{
        listPenjualan:callbackResults[0],
        listDetailPenjualan:callbackResults[1]
      });
    }
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

// app.get('/edit-kategori', (req,res) => {
//   res.render('manager/edit/edit-kategori.ejs');
// });

app.get('/tambah-kategori', (req,res) => {
  res.render('manager/tambah/tambah-kategori.ejs');
});

app.post('/add-kategori',(req, res) => {
  let { nama_kategori } = req.body;
  let sql = `INSERT INTO kategori (no_kategori, nama_kategori) VALUES (NULL, '${nama_kategori}');`;
  let query = conn.query(sql,(err, results) => {
    if(err) throw err;
    res.redirect('/kategori');
  });
});

app.get('/edit-kategori/:no_kategori', (req,res) => {
  let id = req.params.no_kategori;
  console.log(id);
  let sql = "SELECT * FROM kategori WHERE no_kategori="+id+"";
  console.log(sql);
  let query = conn.query(sql,(err, results) => {
    if(err) throw err;
    res.render('manager/edit/edit-kategori.ejs',{
      dataKategori: results[0],
    });
  });
});

app.post('/update-kategori/', (req,res)=>{
  let id = req.body.no_kategori;
  let data = req.body.nama_kategori;
  let sql = "UPDATE kategori SET nama_kategori = '"+data+"' WHERE no_kategori= "+id+";"
  let query = conn.query(sql,data,(err, results) => {
    if(err) throw err;
    res.redirect('/kategori');
  });
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

app.post('/add-jenis',(req, res) => {
  let { nama_jenis } = req.body;
  let sql = `INSERT INTO jenis (no_jenis, nama_jenis) VALUES (NULL, '${nama_jenis}');`;
  let query = conn.query(sql,(err, results) => {
    if(err) throw err;
    res.redirect('/jenis');
  });
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

app.get('/delete-jenis/:no_jenis', (req,res)=>{
  let no = req.params.no_jenis;
  let sql = `DELETE FROM jenis WHERE no_jenis = "${no}";`;
  let query = conn.query(sql,(err, results) => {
    if(err) throw err;
    res.redirect('/jenis');
  });
});