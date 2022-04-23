SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------

--
-- Table structure for table `fuel_prices`
--

CREATE TABLE IF NOT EXISTS `fuel_prices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stationId` varchar(500) NOT NULL,
  `type` int(11) NOT NULL,
  `price` varchar(500) NOT NULL,
  `excludedRewardAmount` varchar(500) NOT NULL DEFAULT '0.00',
  `redeemableRewardAmount` varchar(500) NOT NULL DEFAULT '0.00',
  `date_reported` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `fuel_types`
--

CREATE TABLE IF NOT EXISTS `fuel_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `longDescription` text NOT NULL,
  `shortDescription` text NOT NULL,
  `classification` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `stations`
--

CREATE TABLE IF NOT EXISTS `stations` (
  `id` int(11) NOT NULL,
  `udk` varchar(500) NOT NULL,
  `name` text DEFAULT NULL,
  `retailerId` varchar(500) NOT NULL,
  `retailerName` varchar(500) DEFAULT NULL,
  `phone` varchar(500) DEFAULT NULL,
  `latitude` varchar(500) NOT NULL,
  `longitude` varchar(500) NOT NULL,
  `addressStreet1` text NOT NULL,
  `addressStreet2` text DEFAULT NULL,
  `addressCity` text NOT NULL,
  `addressState` text NOT NULL,
  `addressZipcode` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;