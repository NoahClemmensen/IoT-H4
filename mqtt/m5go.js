const Database = require("../services/DatabaseService");

async function checkClearance(uid, deviceUid) {
    const clearanceNeeded = await Database.getRoomClearanceFromDeviceUid(deviceUid);
    const cardClearance = await Database.getKeycardClearanceFromUid(uid);

    return cardClearance >= clearanceNeeded;
}

async function logAttemptToDatabase(uid, deviceUid, response) {
    const staffId = await Database.getStaffIdFromKeycardUid(uid);
    let roomId;
    try {
        const room = await Database.getRoomFromDeviceUid(deviceUid);
        if (room) {
            roomId = room._id
        } else {
            roomId = null;
        }
    } catch (err) {
        roomId = null;
    }

    await Database.logRfidAttempt(staffId, roomId, deviceUid, response);
}

async function handleRfidAttempt(mqttService, message) {
    const uid = message.uid;
    const deviceUid = message.device_uid;
    if (!uid || !deviceUid) {
        console.error("Invalid message format");
        return;
    }

    let response;
    try {
        if (await checkClearance(uid, deviceUid)) {
            response = JSON.stringify({
                unlock: true
            });
            mqttService.publishToTopic('m5go/unlock', response);
        } else {
            response = JSON.stringify({
                unlock: false,
                reason: "Not authorized"
            });
            mqttService.publishToTopic('m5go/unlock', response);
        }
    } catch (e) {
        response = JSON.stringify({
            unlock: false,
            reason: "Something went wrong"
        })
        mqttService.publishToTopic('m5go/unlock', response);
    } finally {
        await logAttemptToDatabase(uid, deviceUid, response);
    }
}

function setup(mqttService) {
    mqttService.subscribeToTopic('m5go/rfid', async (message) => {
        await handleRfidAttempt(mqttService, message);
    }, (err) => {
        if (err) {
            console.error("Couldn't subscribe to topic m5go/rfid", err);
        }
    });
}

module.exports = setup;
