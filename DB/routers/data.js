const express = require('express');
const router = express.Router();
const supabase = require('../config/supa-connect.js');

router.post('/insert', async (req, res) => {
    console.log('Data insertion requested:', req.body);
    
    try {
        const { data, error } = await supabase
            .from('news_data')
            .insert([req.body])
            .select();

        if (error) throw error;

        res.json({
            message: "Inserted successfully",
            timestamp: new Date().toISOString(),
            data: data
        });
    } catch (error) {
        console.error('Insert error:', error);
        res.status(500).json({
            message: "Insert failed",
            error: error.message
        });
    }
});

router.get('/retrieve', async (req, res) => {
    console.log('Data retrieval requested');
    
    try {
        const { data, error } = await supabase
            .from('news_data')
            .select('*');

        if (error) throw error;

        res.json({
            message: "Retrieved successfully",
            timestamp: new Date().toISOString(),
            data: data
        });
    } catch (error) {
        console.error('Retrieve error:', error);
        res.status(500).json({
            message: "Retrieval failed",
            error: error.message
        });
    }
});

module.exports = router;