const mongoose = require("mongoose");

// Connect to Mongo DB
mongoose.connect("mongodb://localhost:27017/test", {useNewUrlParser: true});


// Create Device Schema
var deviceSchema = new mongoose.Schema({
	os_name: String,                                      
    os_version: String,
    computer_name: String,
    storage_capacity: Number,
    storage_info: [
        {
            disk_id: String,
            disk_size: Number,
            partition_type: String,
            logical_partitions: [
                {
                    volume_serial_no : String,
                    volume_name: String,
                    partition: String, 
                    size: Number
                }
            ]
        }
    ]
});


var Device = mongoose.model("Device", deviceSchema, "device");

function updateDeviceInfo(deviceID, toUpdate) {
	let toSet = {};

	if("osName" in toUpdate) 
		toSet.os_name = toUpdate.osName;
	
	if("osVersion" in toUpdate)
		toSet.os_version = toUpdate.osVersion;

	if("computerName" in toUpdate)
		toSet.computer_name = toUpdate.computerName;

	if("storageCapacity" in toUpdate)
		toSet.storage_capacity = toUpdate.storageCapacity;

	Device.findByIdAndUpdate(deviceID, { $set: toSet }, function(err, updateRes) {
		if(err) {
			console.log(err);
			return;
		}

		console.log(updateRes);
		return;
	});
}

function upateStorageInfo(deviceID, diskID, volumeSerialNo, toUpdate) {
	Device.findOne({os_Name: "Windows"}, { storage_info: 1 }, function(err, deviceDoc) {
	if(err) {
		console.error(err);
		return;
	}

	if(!deviceDoc) {
		console.error("Couldn't get storage info");
		return;
	}

	let toChange;

	deviceDoc.storage_info.map(function(storageDoc, i) {

		if(storageDoc.disk_id == "SAMSUNGMSP3SSD") {

			storageDoc.logical_partitions.map(function(partition, j) {
			
				if(partition.volume_serial_no == "EW32RW3") {

					toChange = `storage_info.${i}.logical_partitions.${j}.disk_size`;
					Device.updateOne({ "storage_info": { $elemMatch: { "disk_id": "SAMSUNGMSP3SSD", "logical_partitions.volume_serial_no": "EW32RW3" } } },
						{ $set: { [`${toChange}`] : 40536870912 }},
						function(err, updateRes){
							if(err) {
								console.error(err);
								return;
							}

							if(updateRes) {
								console.log("Apada updated");
								console.log(updateRes);
								return;
							}
						});
					}
				});
			}
		});
	});
}

updateDeviceInfo("5cfdcc734aced009c350b45e", {});
console.log("End.");
