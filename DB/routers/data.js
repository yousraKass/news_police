const express = require('express');
const router = express.Router();

router.post('/insert', (req, res) => {
    console.log('Data insertion requested:', req.body);
    res.json({
        message: "Inserted successfully",
        timestamp: new Date().toISOString()
    });
});

router.get('/retrieve', (req, res) => {
    console.log('Data retrieval requested');
    res.json({
        message: "Retrieved successfully",
        timestamp: new Date().toISOString()
    });
});

module.exports = router;