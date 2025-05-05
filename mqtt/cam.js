const Database = require('../services/DatabaseService');

function setup(mqttService) {
    mqttService.subscribeToTopic('cam/picture', async (message) => {
        await Database.logPicture(message.toString("base64"));
    }, (err) => {
        if (err) {
            console.error('Error subscribing to cam/picture:', err);
        }
    }, true);
}

module.exports = setup;
