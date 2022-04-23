// async () => {

// })();

// Import the required modules
const Util = new require('../util');
const MysqlWrapper = require('../Helpers/mysql');
const FuelRewardsAPIWrapper = require('../FuelRewardsAPI');
const reRun = {
    amount: null,
    function: null
}
// check to see if a repeat time was given in process.argv

if (process.argv[2] && !isNaN(process.argv[2])) {
    console.log(`Running every ${process.argv[2]} mins`);
    reRun.amount = (Number(process.argv[2]) || 30) * 60 * 1000; // Convert to milliseconds
} else console.warn("No Repeat Time Given, Running Once. If given its x mins");

// Load the modules
const Mysql = new MysqlWrapper(require('../../config/mysql'));
const FuelRewardsAPI = new FuelRewardsAPIWrapper(require("../../config/FuelRewardsAPI"));
const CollectionConfig = require('../../config/DataCollector');

// FuelRewardsAPI.on('debug', console.log);
FuelRewardsAPI.on('error', console.error)

FuelRewardsAPI.on('ready', async () => {
    console.log("Fuel Rewards API is Ready...");
    await run();
    reRun.function = setInterval(await run(), reRun.amount);
});

async function run() {
    console.log("Fuel Recorder Running...");
    let locations = await FuelRewardsAPI.getStations(CollectionConfig.getStations);

    if (locations?.length <= 0 || !locations) return console.log("No Locations Found");

    for (i = 0; i < locations.length; i++) {
        const station = locations[i];
        console.log(`${i + 1}/${locations.length + 1} - ${station.name}(${station.id}): Starting`);
        
        // Check to see if the station is already in the database if not create it.
        if (!await Mysql.getStation(station)) throw new Error(`${i + 1}/${locations.length + 1} - ${station.name}(${station.id}): Station Not Found`);

        
        for (f = 0; f < station.fuelDetails.length; f++) {
            new Promise(async (resolve, reject) => {
                const fuel = station.fuelDetails[f];
                console.log(`${i + 1}/${locations.length + 1} - ${station.name}(${station.id}): Adding Fuel Record for ${fuel.longDescription} @ ${fuel.retailFuelPrice}`);

                const fuelType = await Mysql.getFuelType(fuel);
                if (!fuelType) throw new Error(`${i + 1}/${locations.length + 1} - ${station.name}(${station.id}): Fuel Type Not Found`);

                // Add Fuel Record
                Mysql.query("INSERT INTO fuel_prices (stationId, type, price, excludedRewardAmount, redeemableRewardAmount, date_reported) VALUES (?, ?, ?, ?, ?, ?)", [station.id, fuelType.id, fuel.retailFuelPrice, station.excludedRewardAmount, station.redeemableRewardAmount, station.datePriceReported])
                .then((r) => {
                    console.log(`${i + 1}/${locations.length + 1} - ${station.name}(${station.id}): Added Fuel Record for ${fuel.longDescription} @ ${fuel.retailFuelPrice}`);
                    resolve();
                }).catch((err) => {
                    console.error(err);
                    reject(err);
                });
            });
        }

    }
}