const Database = require("../services/DatabaseService");

function setup(mqttService) {
    mqttService.subscribeToTopic('arduino/temp', async (message) => {
        const temp = message.value;
        const deviceUid = message.device_uid;

        await Database.logTemp(temp, deviceUid);
    });

    mqttService.subscribeToTopic('arduino/get/threshold', async (message) => {
        const settings = await Database.getSettings();
        if (settings && settings.temp_threshold) {
            const threshold = settings.temp_threshold;
            mqttService.publishToTopic('arduino/threshold', JSON.stringify({
                threshold: threshold,
            }));
        }
    });

    mqttService.subscribeToTopic('arduino/humidity', async (message) => {
        const humidity = message.value;
        const deviceUid = message.device_uid;

        await Database.logHumidity(humidity, deviceUid);
    });

    mqttService.subscribeToTopic('arduino/get/interval', async (message) => {
        const settings = await Database.getSettings();
        if (settings && settings.interval) {
            const interval = settings.interval;
            mqttService.publishToTopic('arduino/interval', JSON.stringify({
                interval: interval,
            }));
        }
    });

    mqttService.subscribeToTopic('arduino/fan', async (message) => {
        const state = message.value;
        const deviceUid = message.device_uid;

        await Database.logFanState(state, deviceUid);
    });
}

module.exports = setup;
