const morgan = require("morgan");
const express = require("express");
const mongoose = require("mongoose");

const Device = require("./models/device_info");

var app = express();

// Connect to Mongo DB
mongoose.connect("mongodb://localhost:27017/test", {useNewUrlParser: true});

// Initialize Express
app.use(express.json());
app.use(morgan("dev"));


function updateDeviceInfo(endpointID, toUpdate) {
	let toSet = {};

	if("osName" in toUpdate) 
		toSet.os_name = toUpdate.osName;
	
	if("osVersion" in toUpdate)
		toSet.os_version = toUpdate.osVersion;

	if("computerName" in toUpdate)
		toSet.computer_name = toUpdate.computerName;

	if("storageCapacity" in toUpdate)
		toSet.storage_capacity = toUpdate.storageCapacity;

	console.log(toSet);
	Device.updateOne({ _id: endpointID }, toSet, function(err, updateOpRes) {
		if(err) {
			console.log("Error in updating top level Device Information");
			return;
		}

		console.log(updateOpRes);
		return;
	});
}


function upateStorageInfo(endpointID, diskID, volumeSerialNo, toUpdate) {
	let toSet = {};

	Device.findOne({ _id: endpointID }, { storage_info: 1 }, function(err, deviceDoc) {
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

						if("volumeSerialNo" in toUpdate) 
							toSet[`storage_info.${i}.logical_partitions.${j}.volume_serial_no`] = toUpdate.volumeSerialNo;

						if("volumeName" in toUpdate)
							toSet[`storage_info.${i}.logical_partitions.${j}.volume_name`] = toUpdate.volumeName;

						if("partition" in toUpdate)
							toSet[`storage_info.${i}.logical_partitions.${j}.partition`] = toUpdate.partition;

						if("size" in toUpdate)
							toSet[`storage_info.${i}.logical_partitions.${j}.size`] = toUpdate.size;

						Device.updateOne({ "storage_info": { $elemMatch: { "disk_id": diskID, "logical_partitions.volume_serial_no": volumeSerialNo } } },
							toSet,
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

app.patch("/:psn/:endpointId", function (req, res) {
	const psn = req.params.psn;
	const endpointId = req.params.endpointId;

	var reqBody = req.body;

	try {
		if("storageInfo" in reqBody) {
			if(!(reqBody.storageInfo.constructor == Object)){
				throw {
					status: 422,
					message: "Could not update. Recieved unexpected type for storage info"
				};
			updateStorageInfo(endpointID, reqBody.diskID, reqBody.volumeSerialNo, toUpdate.storageInfo);

			// Delete storage info from request body
			console.log("Deleting \"storageInfo\" from request body.");
			delete reqBody.storageInfo;
			}
		}

		console.log("Update top level Device Infomation");
		updateDeviceInfo(endpointId, reqBody);
		
		res.status(200);
		res.send({
			message: "Device Update successful."
		});
	} catch (e) {
		res.status(e.status || 422);
		res.send({
			"message": e.message
		});
	}
});

/*
updateDeviceInfo("5cfdcc734aced009c350b45e", {
	osName: "Linux",
	osVersion: "Ubuntu 18.04 LTS"
});


upateStorageInfo("5cfdcc734aced009c350b45e", 
	"LENSE20256GMSP34MEAT2TA",
	"282DAB8A",
	{ volumeName: "Movies", size: 37000000});
*/

// Last middleware to reach for wrong URI. Sends back 404
app.use((req, res) => {
	res.status(404).send({ message: "Requested URI not found" } );
});

app.listen(3000, () => {
	console.log("App server started at 3000");
});