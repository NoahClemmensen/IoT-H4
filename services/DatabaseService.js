const mysql = require('mysql2/promise');

let procedureConf = {
    socketPath: process.env.DB_SOCKET,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_PROCEDURE_USER,
    password: process.env.DB_PROCEDURE_PASSWORD,
    database: process.env.DB_NAME,
}

let selectConf = {
    socketPath: process.env.DB_SOCKET,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_SELECT_USER,
    password: process.env.DB_SELECT_PASSWORD,
    database: process.env.DB_NAME,
}

let procedureConn = mysql.createConnection(procedureConf);
let selectConn = mysql.createConnection(selectConf);

class Database {
    // static async getDevices() {
    //     return this.query('SELECT * FROM devices where deleted = 0');
    // }
    //
    // static async getRelevantAlarms() {
    //     return this.query('select * from alarm where timestamp >= date_sub(now(), interval 1 day);');
    // }
    //
    // static async getReceivers() {
    //     return this.query('SELECT * FROM alarm_receiver where active = 1');
    // }
    //
    // static async createReceiver(email, phone) {
    //     return this.queryProcedure('create_alarm_receiver(?,?)', [email, phone]);
    // }
    //
    // static async deleteReceiver(id) {
    //     return this.queryProcedure('delete_alarm_receiver(?)', [id]);
    // }
    //
    // static async getDeviceBySerial(sn) {
    //     return this.query('SELECT * FROM devices WHERE serial = ?', [sn]);
    // }
    //
    // static async checkSerial(sn) {
    //     const result = await this.query('SELECT * FROM devices WHERE serial = ?', [sn]);
    //     return result.length > 0;
    // }
    //
    // static async checkReceiver(id) {
    //     const result = await this.query('SELECT * FROM alarm_receiver WHERE id = ? and active = 1', [id]);
    //     return result.length > 0;
    // }
    //
    // static async getSettings() {
    //     const result = await this.queryProcedure('get_settings()');
    //     return result[0][0];
    // }
    //
    // static async saveSettings(settings) {
    //     return this.queryProcedure('change_settings(?,?,?,?,?,?,?,?,?,?,?)', [settings.max_temp, settings.min_temp, settings.max_fugt, settings.min_fugt, settings.temp_interval, settings.fugt_interval, settings.start_time, settings.end_time, settings.password, settings.max_sound, settings.fahrenheit]);
    // }
    //
    // static async logTemp(temperature, time, deviceSN) {
    //     return this.queryProcedure('log_temp(?,?,?)', [temperature, new Date(time), deviceSN]);
    // }
    //
    // static async logSound(sound, time, deviceSN) {
    //     return this.queryProcedure('log_sound(?,?,?)', [sound, new Date(time), deviceSN]);
    // }
    //
    // static async logHumidity(humidity, time, deviceSN) {
    //     return this.queryProcedure('log_humidity(?,?,?)', [humidity, new Date(time), deviceSN]);
    // }
    //
    // static async getClimateData(deviceSN) {
    //     return this.queryProcedure('get_climate_info(?)', [deviceSN]);
    // }
    //
    // static async editDevice(sn, location, name, desc) {
    //     return this.queryProcedure('edit_device(?,?,?,?)', [sn, location, name, desc]);
    // }
    //
    // static async deleteDevice(sn) {
    //     return this.queryProcedure('delete_device(?)', [sn]);
    // }
    //
    // static async createDevice(sn, location, name, desc) {
    //     return this.queryProcedure('create_device(?,?,?,?)', [sn, location, name, desc]);
    // }

    // static async getPassword() {
    //     const result = await this.query('select password from settings order by id desc limit 1');
    //     return result[0].password;
    // }

    static async getStaffIdFromKeycardUid(uid) {
        let result = await this.query('SELECT staff_id FROM Keycards WHERE uid = ? LIMIT 1', [uid]);
        if (result.length === 0) {
            return null;
        } else {
            result = result[0].staff_id;
        }

        return result;
    }

    static async getKeycardFromUid(uid) {
        let result = await this.query('SELECT * FROM Keycards WHERE uid = ? LIMIT 1', [uid]);
        if (result.length === 0) {
            return null;
        } else {
            result = result[0];
        }

        return result;
    }

    static async getLocationFromDeviceUid(device_uid) {
        let locationId = await this.query('SELECT location_id FROM Devices WHERE uid = ? LIMIT 1', [device_uid]);
        if (locationId.length === 0) {
            return null;
        } else {
            locationId = locationId[0].location_id;
        }

        let location = await this.query('SELECT * FROM Locations WHERE _id = ? AND deleted = 0 LIMIT 1', [locationId]);
        if (location.length === 0) {
            return null;
        } else {
            location = location[0];
        }

        return location;
    }

    static async getRoomFromLocationId(locationId) {
        let roomId = await this.query('SELECT room_id FROM Locations WHERE _id = ? AND deleted = 0 LIMIT 1', [locationId]);
        if (roomId.length === 0) {
            return null;
        } else {
            roomId = roomId[0].room_id;
        }

        let room = await this.query('SELECT * FROM Rooms WHERE _id = ? AND deleted = 0 LIMIT 1', [roomId]);
        if (room.length === 0) {
            return null;
        } else {
            room = room[0];
        }

        return room;
    }

    static async getClearanceLevelFromClearanceId(clearanceId) {
        let clearance = await this.query('SELECT * FROM Clearances WHERE _id = ? LIMIT 1', [clearanceId]);
        if (clearance.length === 0) {
            return null;
        } else {
            clearance = clearance[0].clearance;
        }

        return clearance;
    }

    static async getRoomClearanceFromDeviceUid(device_uid) {
        try {
            const location = await this.getLocationFromDeviceUid(device_uid);
            const room = await this.getRoomFromLocationId(location.room_id);
            return await this.getClearanceLevelFromClearanceId(room.clearance_id);
        } catch (err) {
            throw new Error("Error getting room clearance from device uid");
        }
    }

    static async getRoomFromDeviceUid(device_uid) {
        try {
            const location = await this.getLocationFromDeviceUid(device_uid);
            return await this.getRoomFromLocationId(location.room_id);
        } catch (err) {
            throw new Error("Error getting room from device uid");
        }
    }

    static async getKeycardClearanceFromUid(cardUid) {
        try {
            const keycard = await this.getKeycardFromUid(cardUid);
            if (!keycard) {
                return null;
            }
            return await this.getClearanceLevelFromClearanceId(keycard.clearance_id);
        } catch (err) {
            throw new Error("Error getting keycard clearance from uid");
        }
    }

    static async logRfidAttempt(staffId, roomId, deviceUid, response) {
        try {
            return await this.queryProcedure('log_rfid_attempt(?,?,?,?)', [staffId, roomId, deviceUid, response]);
        } catch (err) {
            throw new Error("Error logging RFID attempt");
        }
    }

    static async logTemp(temperature, deviceUid) {
        try {
            return await this.queryProcedure('log_temp(?,?)', [temperature, deviceUid]);
        } catch (err) {
            throw new Error(err);
        }
    }

    static async logHumidity(humidity, deviceUid) {
        try {
            return await this.queryProcedure('log_humidity(?,?)', [humidity, deviceUid]);
        } catch (err) {
            throw new Error("Error logging humidity");
        }
    }

    static async getSettings() {
        try {
            const result = await this.query('SELECT * FROM Settings ORDER BY _id DESC LIMIT 1');
            return result[0];
        } catch (err) {
            throw new Error("Error getting settings");
        }
    }

    static async saveSettings(tempThreshold, interval, keypadCode) {
        try {
            return await this.queryProcedure('save_settings(?,?,?)', [tempThreshold, interval, keypadCode]);
        } catch (err) {
            throw new Error(err);
        }
    }

    static async logKeypadAttempt(deviceUid, buffer, granted) {
        try {
            return await this.queryProcedure('log_keypad_attempt(?,?,?)', [deviceUid, buffer, granted]);
        } catch (err) {
            throw new Error("Error logging keypad attempt");
        }
    }

    static async logDoorStatus(status, deviceUid) {
        try {
            return await this.queryProcedure('log_door_status(?,?)', [status, deviceUid]);
        } catch (err) {
            throw new Error(err);
        }
    }

    static async getStaff(){
        try {
            return await this.query('SELECT * FROM Staff WHERE deleted = 0');
        } catch (err) {
            throw new Error("Error getting staff");
        }
    }

    static async getKeycards() {
        try {
            return await this.query('SELECT * FROM Keycards left join Clearances on Clearances._id = Keycards.clearance_id WHERE deleted = 0');
        } catch (err) {
            throw new Error("Error getting keycards");
        }
    }

    static async deleteStaff(staffId) {
        try {
            return await this.queryProcedure('delete_staff(?)', [staffId]);
        } catch (err) {
            throw new Error("Error deleting staff");
        }
    }

    static async deleteLocation(locationId) {
        try {
            return await this.queryProcedure('delete_location(?)', [locationId]);
        } catch (err) {
            throw new Error("Error deleting location");
        }
    }

    static async deleteRoom(roomId) {
        try {
            return await this.queryProcedure('delete_room(?)', [roomId]);
        } catch (err) {
            throw new Error("Error deleting room");
        }
    }

    static async addStaff(name) {
        try {
            return await this.queryProcedure('add_staff(?)', [name]);
        } catch (err) {
            throw new Error("Error adding staff");
        }
    }

    static async deleteKeycard(uid) {
        try {
            return await this.queryProcedure('delete_keycard(?)', [uid]);
        } catch (err) {
            throw new Error("Error deleting keycard");
        }
    }

    static async addKeycard(uid) {
        try {
            return await this.queryProcedure('create_keycard(?)', [uid]);
        } catch (err) {
            throw new Error("Error adding keycard");
        }
    }

    static async updateStaff(id, name, keycard_uid) {
        try {
            return await this.queryProcedure('update_staff(?,?,?)', [id, name, keycard_uid]);
        } catch (err) {
            throw new Error("Error updating staff");
        }
    }

    static async logPicture(binary) {
        try {
            return await this.queryProcedure('log_picture(?)', [binary]);
        } catch (err) {
            throw new Error("Error logging picture");
        }
    }

    static async logFanState(state, deviceUid) {
        try {
            return await this.queryProcedure('log_fan_status(?,?)', [state, deviceUid]);
        } catch (err) {
            throw new Error(err);
        }
    }

    static async query(sql, args) {
        if (selectConn instanceof Promise) {
            selectConn = await selectConn;
        }

        const [results, fields] = await selectConn.query(sql, args);
        return results;
    }

    static async queryProcedure(sql, args) {
        if (procedureConn instanceof Promise) {
            procedureConn = await procedureConn;
        }

        const [results, fields] = await procedureConn.query('call ' + sql, args);
        return results;
    }
}

module.exports = Database;
