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
        // 1. Fetch from Truecaller
        let truecallerName = "N/A";
        try {
            const truecallerRes = await axios.get(`https://sbsakib.eu.cc/apis/truecaller?key=Test&number1=${number}`, { timeout: 4000 });
            truecallerName = truecallerRes.data?.results?.name || "N/A";
        } catch (e) {
            truecallerName = "API Offline";
        }

        // 2. Fetch from Sim Data
        let allSimRecords = [];
        try {
            const simDataRes = await axios.get(`https://ramzan-simdata.deno.dev/?number=${number}`, { timeout: 4000 });
            allSimRecords = simDataRes.data?.data || [];
        } catch (e) {
            console.log("Sim Data Offline");
        }

        // 3. Process Logic
        let finalResults = [];
        if (allSimRecords.length > 0) {
            finalResults = allSimRecords.map(record => ({
                Truecaller_Name: truecallerName,
                Owner_Name: record.name || "N/A",
                Number: record.number || number,
                CNIC: record.cnic || "N/A",
                Address: record.address || "N/A",
            }));
        } else {
            finalResults.push({
                Truecaller_Name: truecallerName,
                Owner_Name: "Record Not Found",
                Number: number,
                CNIC: "N/A",
                Address: "N/A"
            });
        }

        const responseData = {
            Status: "Success",
            Total: finalResults.length,
            Data: finalResults,
            WhatsApp: "https://chat.whatsapp.com/LoafyPWMGOv88oElxdwOB8",
            Developed_By: "Ramzan Ahsan"
        };

        // --- CLEAR VIEW FIX ---
        // Sending the JSON with 2-space indentation so it looks neat in the browser
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(JSON.stringify(responseData, null, 2));

    } catch (error) {
        res.status(500).json({ error: "Server Error", Developed_By: "Ramzan Ahsan" });
    }
}
