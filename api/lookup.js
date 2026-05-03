const axios = require('axios');

export default async function handler(req, res) {
    // --- CORS Headers ---
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { number } = req.query;

    if (!number) {
        return res.status(400).json({ error: "Please provide a phone number." });
    }

    try {
        // 1. Fetch from Truecaller API
        const truecallerRes = await axios.get(`https://sbsakib.eu.cc/apis/truecaller?key=Test&number1=${number}`);
        const truecallerName = truecallerRes.data?.results?.name || "N/A";

        // 2. Fetch from Sim Data API
        const simDataRes = await axios.get(`https://ramzan-simdata.deno.dev/?number=${number}`);
        const allSimRecords = simDataRes.data?.data || [];

        // 3. Process all records from Sim Data API
        const formattedRecords = allSimRecords.map(record => ({
            Truecaller_Name: truecallerName,
            Owner_Name: record.name || "N/A",
            Number: record.number || number,
            CNIC: record.cnic || "N/A",
            Address: record.address || "N/A",
        }));

        // 4. Final Response Structure
        const responseData = {
            Status: "Success",
            Total_Records: formattedRecords.length,
            Results: formattedRecords,
            WhatsApp_Group: "https://chat.whatsapp.com/LoafyPWMGOv88oElxdwOB8",
            Developed_By: "Ramzan Ahsan"
        };

        res.status(200).json(responseData);

    } catch (error) {
        res.status(500).json({ 
            error: "Connection Error", 
            Developed_By: "Ramzan Ahsan" 
        });
    }
}
