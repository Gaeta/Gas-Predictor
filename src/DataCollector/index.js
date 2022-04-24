// async () => {
    
    // })();
    
// Import the required modules
const Util = new require('../Util');
const MysqlWrapper = require('../Helpers/mysql');
const FuelRewardsAPIWrapper = require('../FuelRewardsAPI');
const FuelRewardsAPI = new FuelRewardsAPIWrapper(require("../../config/FuelRewardsAPI"));
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
const CollectionConfig = require('../../config/DataCollector');

FuelRewardsAPI.on('error', console.error)
// FuelRewardsAPI.on('debug', console.log)

FuelRewardsAPI.on('ready', async () => {
    console.log("Fuel Recorder Running...");
    await run();
    if (reRun.amount) reRun.function = setInterval(run, reRun.amount);
});

async function run() {
    const Mysql = new MysqlWrapper(require('../../config/mysql'));
    console.log("Fuel Rewards API is Ready, Starting Collection...");
    let locations = await FuelRewardsAPI.getStations(CollectionConfig.getStations);

    if (locations?.length <= 0 || !locations) return console.log("No Locations Found");

    for (i = 0; i < locations.length; i++) {
        const station = locations[i];
        console.log(`${i + 1}/${locations.length + 1} - ${station.name}(${station.id}): Starting`);
        
        // Check to see if the station is already in the database if not create it.
        if (!await Mysql.getStation(station)) throw new Error(`${i + 1}/${locations.length + 1} - ${station.name}(${station.id}): Station Not Found`);
        
        for (f = 0; f < station.fuelDetails.length; f++) {
            const fuel = station.fuelDetails[f];
            if (!fuel.retailFuelPrice) fuel.retailFuelPrice = "0.00";
            console.log(`${i + 1}/${locations.length + 1} - ${station.name}(${station.id}): Adding Fuel Record for ${fuel.longDescription} @ ${fuel.retailFuelPrice}`);

            const fuelType = await Mysql.getFuelType(fuel);
            if (!fuelType) throw new Error(`${i + 1}/${locations.length + 1} - ${station.name}(${station.id}): Fuel Type Not Found`);

            try {
                Mysql.query("INSERT INTO fuel_prices (stationId, type, price, excludedRewardAmount, redeemableRewardAmount, date_reported) VALUES (?, ?, ?, ?, ?, ?)", [station.id, fuelType.id, fuel.retailFuelPrice, station.excludedRewardAmount, station.redeemableRewardAmount, station.datePriceReported])
                console.log(`${i + 1}/${locations.length + 1} - ${station.name}(${station.id}): Added Fuel Record for ${fuel.longDescription} @ ${fuel.retailFuelPrice}`);
            } catch (e) {
                console.error(e);
            }
            console.log(`${i + 1}/${locations.length + 1} - ${station.name}(${station.id}): Finished`);
        }
    }
    if (reRun.amount) console.log("Fuel Recorder Finished, Running Again in " + (reRun.amount / 1000 / 60) + " mins");
    else console.log("Fuel Recorder Finished, Running Once");
    // Close the mysql connection
    await Mysql.close();
}