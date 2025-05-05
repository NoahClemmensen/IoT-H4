const Database = require("../services/DatabaseService");

function setup(mqttService) {
    mqttService.subscribeToTopic('door/status', async (message) => {
        const deviceUid = message.device_uid;
        const status = message.status;

        if (!deviceUid || !status) {
            console.error("Invalid message format for door/status topic:", message);
            return;
        }


        await Database.logDoorStatus(JSON.stringify(message), deviceUid);
    }, (err) => {
        if (err) {
            console.error("Error subscribing to door/status topic:", err);
        }
    });

    mqttService.subscribeToTopic('door/alarm', async (message) => {
        const deviceUid = message.device_uid;

        if (!deviceUid) {
            console.error("Invalid message format for door/alarm topic:", message);
            return;
        }

        await Database.logDoorStatus(JSON.stringify(message), deviceUid);
    }, (err) => {
        if (err) {
            console.error("Error subscribing to door/alarm topic:", err);
        }
    });
}

module.exports = setup;
