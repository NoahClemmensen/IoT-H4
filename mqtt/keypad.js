const Database = require("../services/DatabaseService");

function setup(mqttService) {
    mqttService.subscribeToTopic('keypad/submit', async (message) => {
        const buffer = message.buffer;
        const deviceUid = message.device_uid;
        const validKey = message.valid_key;

        if (!buffer || !deviceUid) {
            console.error("Invalid message format");
            return;
        }

        await Database.logKeypadAttempt(deviceUid, buffer, (validKey === buffer));

        const settings = await Database.getSettings();
        if (settings && settings.keypad_code) {
            mqttService.publishToTopic('keypad/code', JSON.stringify({
                code: settings.keypad_code
            }));
        }
    })
}

module.exports = setup;
