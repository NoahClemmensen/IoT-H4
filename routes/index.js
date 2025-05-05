var express = require('express');
var router = express.Router();
const Database = require('../services/DatabaseService');
const MQTTService = require('../services/MQTTService');

/* GET home page. */
router.get('/', async function (req, res, next) {
    const settings = await Database.getSettings();
    const staff = await Database.getStaff();
    const keycards = await Database.getKeycards();
    console.log(keycards);
    res.render('index', {title: 'IOT main page', settings: settings, staff: staff, keycards: keycards});
});

router.post('/settings/save', async function (req, res, next) {
    const tempThreshold = req.body.temp_threshold;
    const interval = req.body.interval;
    const keypadCode = req.body.keypad_code;

    if (!tempThreshold || !interval || !keypadCode) {
        return res.status(400).json({status: 'error', message: 'Missing required fields'});
    }

    try {
        await Database.saveSettings(tempThreshold, interval, keypadCode);
        res.status(200).json({status: 'success', message: 'Settings saved successfully'});
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({status: 'error', message: 'Internal server error'});
    } finally {
        const settings = await Database.getSettings();
        MQTTService.publishToTopic("arduino/threshold", JSON.stringify({threshold: settings.temp_threshold}));
        MQTTService.publishToTopic("arduino/interval", JSON.stringify({interval: settings.interval}));
        MQTTService.publishToTopic("keypad/code", JSON.stringify({keypad_code: settings.keypad_code}));
    }
});

router.delete('/staff/delete/:id', async function (req, res, next) {
    const staffId = req.params.id;

    try {
        await Database.deleteStaff(staffId);
        res.status(200).json({status: 'success', message: 'Staff deleted successfully'});
    } catch (error) {
        console.error('Error deleting staff:', error);
        res.status(500).json({status: 'error', message: 'Internal server error'});
    }
});

router.post('/staff/new/:name', async function (req, res, next) {
    const name = req.params.name;

    try {
        const newStaff = await Database.addStaff(name);
        res.status(200).json({status: 'success', message: 'Staff added successfully', staff: newStaff});
    } catch (error) {
        console.error('Error adding staff:', error);
        res.status(500).json({status: 'error', message: 'Internal server error'});
    }
});

router.post('/staff/:id', async function (req, res, next) {
    const staffId = req.params.id;
    const staffName = req.body.name;
    const keycardUid = req.body.keycard_uid;

    try {
        await Database.updateStaff(staffId, staffName, keycardUid);
        res.status(200).json({status: 'success', message: 'Staff updated successfully'});
    } catch (error) {
        console.error('Error updating staff:', error);
        res.status(500).json({status: 'error', message: 'Internal server error'});
    }
})

router.delete('/keycard/delete/:id', async function (req, res, next) {
    const uid = req.params.id;

    try {
        await Database.deleteKeycard(uid);
        res.status(200).json({status: 'success', message: 'Keycard deleted successfully'});
    } catch (error) {
        console.error('Error deleting keycard:', error);
        res.status(500).json({status: 'error', message: 'Internal server error'});
    }
});

router.post('/keycard/new/:uid', async function (req, res, next) {
    const uid = req.params.uid;

    try {
        const newKeycard = await Database.addKeycard(uid);
        res.status(200).json({status: 'success', message: 'Keycard added successfully', keycard: newKeycard});
    } catch (error) {
        console.error('Error adding keycard:', error);
        res.status(500).json({status: 'error', message: 'Internal server error'});
    }
});

// router.delete('/locations/delete/:id', async function (req, res, next) {
//     const locationId = req.params.id;
//
//     try {
//         await Database.deleteLocation(locationId);
//         res.status(200).json({status: 'success', message: 'Location deleted successfully'});
//     } catch (error) {
//         console.error('Error deleting location:', error);
//         res.status(500).json({status: 'error', message: 'Internal server error'});
//     }
// })
//
// router.delete('/rooms/delete/:id', async function (req, res, next) {
//     const roomId = req.params.id;
//
//     try {
//         await Database.deleteRoom(roomId);
//         res.status(200).json({status: 'success', message: 'Room deleted successfully'});
//     } catch (error) {
//         console.error('Error deleting room:', error);
//         res.status(500).json({status: 'error', message: 'Internal server error'});
//     }
// })

/* Check keycard uid */
// router.get('/checkKeycard', async function (req, res, next) {
//     const uid = req.query.uid;
//     const device_uid = req.query.device_uid;
//
//     const clearanceNeeded = await Database.getRoomClearanceFromDeviceUid(device_uid);
//     const cardClearance = await Database.getKeycardClearanceFromUid(uid);
//
//     console.log(cardClearance, clearanceNeeded);
//
//     if (cardClearance >= clearanceNeeded) {
//         res.status(200).json({status: 'success', message: 'Keycard is valid'});
//     } else {
//         res.status(403).json({status: 'error', message: 'Keycard is invalid'});
//     }
// });

/* Get staff from keycard uid */
router.get('/getStaffFromKeycardUid', async function (req, res, next) {
    const uid = req.query.uid;

    try {
        const staff = await Database.getStaffIdFromKeycardUid(uid);
        if (staff) {
            res.status(200).json({status: 'success', staff: staff});
        } else {
            res.status(404).json({status: 'error', message: 'Staff not found'});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({status: 'error', message: 'Internal server error'});
    }
});


module.exports = router;
