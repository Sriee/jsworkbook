function updateStorageInfo(toUpdate) {
	let toSet = {};
	let i = 0, j = 1;

	try {
		// Perform validation
		if(! ("diskId" in toUpdate) ){
			// res.status(400)
			// res.send({
			// 		"message": "Missing \"DiskId\" parameter in update request."
			// })
			throw {
				status: 422, 
				message: "return proper status message"
			};
		}

		if("volumeSerialNo" in toUpdate) 
			toSet[`storage_info.${i}.logical_partitions.${j}.volume_serial_no`] = toUpdate.volumeSerialNo;

		if("volumeName" in toUpdate)
			toSet[`storage_info.${i}.logical_partitions.${j}.volume_name`] = toUpdate.volumeName;

		if("partition" in toUpdate)
			toSet[`storage_info.${i}.logical_partitions.${j}.partition`] = toUpdate.partition;

		if("size" in toUpdate)
			toSet[`storage_info.${i}.logical_partitions.${j}.size`] = toUpdate.size;

		console.log(toSet);
	} catch (e) {
		console.log(e);
	}
	
}


function checking(toUpdate) {
	if("storageInfo" in toUpdate) {
		if(! (toUpdate.storageInfo instanceof Object) ){
			console.log("Magunu amachar");
		}
		updateStorageInfo(toUpdate.storageInfo);
	}

	delete toUpdate.storageInfo;
	console.log("Update upper level Device Info");
	console.log(toUpdate);
}


checking({
	osName: "Linux",
	osVersion: "Ubuntu 18.04 LTS",
	storageInfo: [{
		diskId: "LENSE20256GMSP34MEAT2TA",
		volumeSerialNo: "282DAB8A",
		volumeName: "Entertainment",
	}]
});
