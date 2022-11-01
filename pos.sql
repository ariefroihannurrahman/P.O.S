-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 01, 2022 at 06:28 PM
-- Server version: 10.4.25-MariaDB
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pos`
--

-- --------------------------------------------------------

--
-- Table structure for table `detailpenjualan`
--

CREATE TABLE `detailpenjualan` (
  `no_detail` int(11) NOT NULL,
  `kd_detail` varchar(25) NOT NULL,
  `no_produk` int(11) NOT NULL,
  `kuantitas` int(11) NOT NULL,
  `subtotal` int(11) NOT NULL,
  `no_penjualan` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `detailpenjualan`
--

INSERT INTO `detailpenjualan` (`no_detail`, `kd_detail`, `no_produk`, `kuantitas`, `subtotal`, `no_penjualan`) VALUES
(1, 'P01112022010001D001', 1, 2, 10000, 1),
(2, 'P01112022010001D001', 2, 1, 15000, 1),
(3, 'P01112022010001D001', 1, 1, 5000, 1),
(4, 'P01112022010001D001', 2, 4, 60000, 1);

-- --------------------------------------------------------

--
-- Table structure for table `jenis`
--

CREATE TABLE `jenis` (
  `no_jenis` int(11) NOT NULL,
  `nama_jenis` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `jenis`
--

INSERT INTO `jenis` (`no_jenis`, `nama_jenis`) VALUES
(1, 'Makanan'),
(2, 'Minuman');

-- --------------------------------------------------------

--
-- Table structure for table `karyawan`
--

CREATE TABLE `karyawan` (
  `no_karyawan` int(11) NOT NULL,
  `id_karyawan` int(11) NOT NULL,
  `nama_karyawan` varchar(25) NOT NULL,
  `gambar_karyawan` text NOT NULL,
  `nomor_handphone` varchar(12) NOT NULL,
  `jenis_kelamin` varchar(25) NOT NULL,
  `tanggal_rekrut` date NOT NULL,
  `jabatan` varchar(25) NOT NULL,
  `kode` varchar(25) NOT NULL,
  `alamat` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `karyawan`
--

INSERT INTO `karyawan` (`no_karyawan`, `id_karyawan`, `nama_karyawan`, `gambar_karyawan`, `nomor_handphone`, `jenis_kelamin`, `tanggal_rekrut`, `jabatan`, `kode`, `alamat`) VALUES
(1, 3001, 'Arief Roihan Nur Rahman', 'profile-1.jpg', '081081081081', 'pria', '2022-11-01', 'kasir', 'ê¿†Î«', 'Jl. Kopo');

-- --------------------------------------------------------

--
-- Table structure for table `kategori`
--

CREATE TABLE `kategori` (
  `no_kategori` int(11) NOT NULL,
  `nama_kategori` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `kategori`
--

INSERT INTO `kategori` (`no_kategori`, `nama_kategori`) VALUES
(1, 'lokal'),
(2, 'internasional');

-- --------------------------------------------------------

--
-- Table structure for table `penjualan`
--

CREATE TABLE `penjualan` (
  `no_penjualan` int(11) NOT NULL,
  `kd_penjualan` varchar(25) NOT NULL,
  `no_karyawan` int(11) NOT NULL,
  `tanggal_penjualan` date NOT NULL,
  `deskripsi` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `penjualan`
--

INSERT INTO `penjualan` (`no_penjualan`, `kd_penjualan`, `no_karyawan`, `tanggal_penjualan`, `deskripsi`) VALUES
(1, 'P01112022010001', 1, '2022-11-01', '');

-- --------------------------------------------------------

--
-- Table structure for table `produk`
--

CREATE TABLE `produk` (
  `no_produk` int(11) NOT NULL,
  `kd_produk` varchar(25) NOT NULL,
  `nama_produk` varchar(25) NOT NULL,
  `gambar_produk` text NOT NULL,
  `no_jenis` int(11) NOT NULL,
  `no_kategori` int(11) NOT NULL,
  `harga` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `produk`
--

INSERT INTO `produk` (`no_produk`, `kd_produk`, `nama_produk`, `gambar_produk`, `no_jenis`, `no_kategori`, `harga`) VALUES
(1, 'J01K1001', 'Peuyeum', 'Peyeum.jpeg', 1, 1, 5000),
(2, 'J02K2002', 'Thai Tea', 'ThaiTea.jpeg', 2, 2, 15000);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `detailpenjualan`
--
ALTER TABLE `detailpenjualan`
  ADD PRIMARY KEY (`no_detail`),
  ADD KEY `no_penjualan` (`no_penjualan`),
  ADD KEY `no_produk` (`no_produk`);

--
-- Indexes for table `jenis`
--
ALTER TABLE `jenis`
  ADD PRIMARY KEY (`no_jenis`);

--
-- Indexes for table `karyawan`
--
ALTER TABLE `karyawan`
  ADD PRIMARY KEY (`no_karyawan`);

--
-- Indexes for table `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`no_kategori`);

--
-- Indexes for table `penjualan`
--
ALTER TABLE `penjualan`
  ADD PRIMARY KEY (`no_penjualan`),
  ADD KEY `no_karyawan` (`no_karyawan`);

--
-- Indexes for table `produk`
--
ALTER TABLE `produk`
  ADD PRIMARY KEY (`no_produk`),
  ADD KEY `no_jenis` (`no_jenis`),
  ADD KEY `no_kategori` (`no_kategori`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `detailpenjualan`
--
ALTER TABLE `detailpenjualan`
  MODIFY `no_detail` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `jenis`
--
ALTER TABLE `jenis`
  MODIFY `no_jenis` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `karyawan`
--
ALTER TABLE `karyawan`
  MODIFY `no_karyawan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `kategori`
--
ALTER TABLE `kategori`
  MODIFY `no_kategori` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `penjualan`
--
ALTER TABLE `penjualan`
  MODIFY `no_penjualan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `produk`
--
ALTER TABLE `produk`
  MODIFY `no_produk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `detailpenjualan`
--
ALTER TABLE `detailpenjualan`
  ADD CONSTRAINT `detailpenjualan_ibfk_1` FOREIGN KEY (`no_penjualan`) REFERENCES `penjualan` (`no_penjualan`),
  ADD CONSTRAINT `detailpenjualan_ibfk_2` FOREIGN KEY (`no_produk`) REFERENCES `produk` (`no_produk`);

--
-- Constraints for table `penjualan`
--
ALTER TABLE `penjualan`
  ADD CONSTRAINT `penjualan_ibfk_1` FOREIGN KEY (`no_karyawan`) REFERENCES `karyawan` (`no_karyawan`);

--
-- Constraints for table `produk`
--
ALTER TABLE `produk`
  ADD CONSTRAINT `produk_ibfk_1` FOREIGN KEY (`no_jenis`) REFERENCES `jenis` (`no_jenis`),
  ADD CONSTRAINT `produk_ibfk_2` FOREIGN KEY (`no_kategori`) REFERENCES `kategori` (`no_kategori`),
  ADD CONSTRAINT `produk_ibfk_3` FOREIGN KEY (`no_kategori`) REFERENCES `kategori` (`no_kategori`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
