const express = require('express');
const router = express.Router();
const supabase = require('../config/supa-connect.js');

router.post('/insert', async (req, res) => {
    console.log('Query data insertion requested:', req.body);
    
    try {
        const { data, error } = await supabase
            .from('query_data')
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
    console.log('Query data retrieval requested');
    
    try {
        const { data, error } = await supabase
            .from('query_data')
            .select('*')
            .order('created_at', { ascending: false });

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