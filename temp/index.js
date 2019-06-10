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

	Device.updateOne({ _id: deviceID }, toSet, function(err, updateOpRes) {
		if(err) {
			console.log(err);
			return;
		}

		console.log(updateOpRes);
	});
}


function upateStorageInfo(deviceID, diskID, volumeSerialNo, toUpdate) {
	let toSet = {};

	if("volumeSerialNo" in toUpdate) 
		toSet.volume_serial_no = toUpdate.volumeSerialNo;
	
	if("volumeName" in toUpdate)
		toSet.volume_name = toUpdate.volumeName;

	if("partition" in toUpdate)
		toSet.partition = toUpdate.partition;

	if("size" in toUpdate)
		toSet.size = toUpdate.size;

	Device.findOne({ _id: deviceID }, { storage_info: 1 }, function(err, deviceDoc) {
		if(err) {
			console.error(err);
			return;
		}

		if(!deviceDoc) {
			console.error("Couldn't get storage info");
			return;
		
		}

		let toChange = {};

		deviceDoc.storage_info.map(function(storageDoc, i) {

			if(storageDoc.disk_id == diskID) {

				storageDoc.logical_partitions.map(function(partition, j) {
				
					if(partition.volume_serial_no == volumeSerialNo) {

						toChange = `storage_info.${i}.logical_partitions.${j}.disk_size`;
						Device.updateOne({ "storage_info": { $elemMatch: { "disk_id": diskID, "logical_partitions.volume_serial_no": volumeSerialNo } } },
							toChange,
							function(err, updateRes){
								if(err) {
									console.error(err);
									return;
								}

								if(updateRes) {
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

/*
updateDeviceInfo("5cfdcc734aced009c350b45e", {
	osName: "Linux",
	osVersion: "Ubuntu 18.04 LTS"
});
*/

upateStorageInfo("5cfdcc734aced009c350b45e", 
	"LENSE20256GMSP34MEAT2TA",
	"282DAB8A",
	{ volumeName: "Movies", size: 37000000});

console.log("End.");
