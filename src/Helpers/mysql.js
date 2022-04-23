// The Mysql Utils module is a wrapper for the mysql module.
// It provides a simple interface for connecting to a mysql database.
const mysql = require("mysql");
const config = require("../../config/mysql");

class MysqlWrapper {
    constructor() {
        // Create a new mysql pool connection.
        this.connection = mysql.createPool(config);

        // Check to see if all the tables exist and if they dont create them.
        this.query("SELECT id from stations limit 1").then((results) => {
            if (results.length <= 0) {
                this.query(`
                CREATE TABLE IF NOT EXISTS \`stations\` (
                    \`id\` int(11) NOT NULL,
                    \`udk\` varchar(500) NOT NULL,
                    \`name\` text DEFAULT NULL,
                    \`retailerId\` varchar(500) NOT NULL,
                    \`retailerName\` varchar(500) DEFAULT NULL,
                    \`phone\` varchar(500) DEFAULT NULL,
                    \`latitude\` varchar(500) NOT NULL,
                    \`longitude\` varchar(500) NOT NULL,
                    \`addressStreet1\` text NOT NULL,
                    \`addressStreet2\` text DEFAULT NULL,
                    \`addressCity\` text NOT NULL,
                    \`addressState\` text NOT NULL,
                    \`addressZipcode\` text NOT NULL,
                    PRIMARY KEY (\`id\`),
                    UNIQUE KEY \`id\` (\`id\`)
                  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
                `).then(() => {
                    console.log("Created stations table");
                }).catch((err) => {
                    console.error(err);
                });
            }
        }).catch((err) => {
            console.error(err);
        });

        this.query("SELECT id from fuel_types limit 1").then((results) => {
            if (results.length <= 0) {
                this.query(`
                CREATE TABLE IF NOT EXISTS \`fuel_types\` (
                    \`id\` int(11) NOT NULL AUTO_INCREMENT,
                    \`longDescription\` text NOT NULL,
                    \`shortDescription\` text NOT NULL,
                    \`classification\` text NOT NULL,
                    PRIMARY KEY (\`id\`),
                    UNIQUE KEY \`id\` (\`id\`)
                  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
                `).then(() => {
                    console.log("Created stations table");
                }).catch((err) => {
                    console.error(err);
                });
            }
        }).catch((err) => {
            console.error(err);
        });

        this.query("SELECT id from fuel_prices limit 1").then((results) => {
            if (results.length <= 0) {
                this.query(`
                CREATE TABLE IF NOT EXISTS \`fuel_prices\` (
                    \`id\` int(11) NOT NULL AUTO_INCREMENT,
                    \`stationId\` varchar(500) NOT NULL,
                    \`type\` int(11) NOT NULL,
                    \`price\` varchar(500) NOT NULL,
                    \`excludedRewardAmount\` varchar(500) NOT NULL DEFAULT '0.00',
                    \`redeemableRewardAmount\` varchar(500) NOT NULL DEFAULT '0.00',
                    \`date_reported\` datetime NOT NULL,
                    PRIMARY KEY (\`id\`),
                    UNIQUE KEY \`id\` (\`id\`)
                  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
                `).then(() => {
                    console.log("Created stations table");
                }).catch((err) => {
                    console.error(err);
                });
            }
        }).catch((err) => {
            console.error(err);
        });
    }

    // Connects to the database.
    connect() {
        this.connection = mysql.createPool(config);
        return this.connection;
    }

    // Closes the connection to the database.
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end((err) => {
                if (err) reject(err)
                else resolve();
            });
        });
    }

    // Executes a query on the database.
    query(query, values) {
        return new Promise((resolve, reject) => {
            this.connection.query(query, values, (err, results) => {
                if (err) reject(err)
                else resolve(results);
            });
        });
    }

    getStation(station) {
        return new Promise((resolve, reject) => {
            this.query(`SELECT * FROM stations WHERE id = ${station.id}`).then((results) => {
                if (results.length > 0) return resolve(results[0]);
                // insert it into the database
                this.query("INSERT INTO stations (id, udk, name, retailerId, retailerName, phone, latitude, longitude, addressStreet1, addressStreet2, addressCity, addressState, addressZipcode) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", [
                    station.id,
                    station.udk,
                    station.name,
                    station.retailerId,
                    station.retailerName,
                    station.phone,
                    station.latitude,
                    station.longitude,
                    station.address.street1,
                    station.address.street2,
                    station.address.city,
                    station.address.stateCode,
                    station.address.zipCode
                ]).then(() => {
                    return resolve({
                        id: station.id,
                        udk: station.udk,
                        name: station.name,
                        retailerId: station.retailerId,
                        retailerName: station.retailerName,
                        phone: station.phone,
                        latitude: station.latitude,
                        longitude: station.longitude,
                        addressStreet1: station.address.street1,
                        addressStreet2: station.address.street2,
                        addressCity: station.address.city,
                        addressState: station.address.stateCode,
                        addressZipcode: station.address.zipCode
                    });
                }).catch(reject);
            }).catch(reject);
        });
    }

    getFuelType(type) {
        return new Promise((resolve, reject) => {
            this.query("SELECT * FROM fuel_types WHERE classification = ?", type.fuelClassification).then((results) => {
                if (results.length > 0) return resolve(results[0]);
                // insert it into the database
                this.query("INSERT INTO fuel_types (id, longDescription, shortDescription, classification) VALUES (?,?,?,?)", [
                    type.id,
                    type.longDescription,
                    type.shortDescription,
                    type.fuelClassification
                ]).then(() => {
                    return resolve({
                        id: type.id,
                        longDescription: type.longDescription,
                        shortDescription: type.shortDescription,
                        classification: type.fuelClassification
                    });
                }).catch(reject);
            }).catch(reject);
        });
    }
}

module.exports = MysqlWrapper;