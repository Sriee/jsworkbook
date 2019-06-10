function checking(toUpdate) {
	let toSet = {};

	if("volumeSerialNo" in toUpdate) 
		toSet.volume_serial_no = toUpdate.volumeSerialNo;
	
	if("volumeName" in toUpdate)
		toSet.volume_name = toUpdate.volumeName;

	if("partition" in toUpdate)
		toSet.partition = toUpdate.partition;

	if("size" in toUpdate)
		toSet.size = toUpdate.size;

	var i = 0, j = 1;
	
	console.log(toSet);
}


checking({
	osName: "Linux",
	osVersion: "Etho oru version"
});
