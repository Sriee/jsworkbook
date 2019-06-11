const mongoose = require("mongoose");


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

module.exports = Device;