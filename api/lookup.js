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
        // 1. Fetch from Truecaller (with safety catch)
        let truecallerName = "Not Found in Truecaller";
        try {
            const truecallerRes = await axios.get(`https://sbsakib.eu.cc/apis/truecaller?key=Test&number1=${number}`, { timeout: 5000 });
            truecallerName = truecallerRes.data?.results?.name || "Not Found in Truecaller";
        } catch (e) {
            console.log("Truecaller API Offline");
        }

        // 2. Fetch from Sim Data (with safety catch)
        let allSimRecords = [];
        try {
            const simDataRes = await axios.get(`https://ramzan-simdata.deno.dev/?number=${number}`, { timeout: 5000 });
            allSimRecords = simDataRes.data?.data || [];
        } catch (e) {
            console.log("Sim Data API Offline");
        }

        // 3. Logic to handle "Not Found" cases
        let finalResults = [];

        if (allSimRecords.length > 0) {
            // If Sim Data has records, map them and attach the Truecaller name
            finalResults = allSimRecords.map(record => ({
                Truecaller_Name: truecallerName,
                Owner_Name: record.name || "N/A",
                Number: record.number || number,
                CNIC: record.cnic || "N/A",
                Address: record.address || "N/A",
            }));
        } else {
            // If Sim Data is empty but Truecaller has a name, show at least one record
            finalResults.push({
                Truecaller_Name: truecallerName,
                Owner_Name: "No Record in Sim Database",
                Number: number,
                CNIC: "N/A",
                Address: "N/A"
            });
        }

        // 4. Final Clean Response
        const responseData = {
            Status: "Success",
            Total_Records: finalResults.length,
            Results: finalResults,
            WhatsApp_Group: "https://chat.whatsapp.com/LoafyPWMGOv88oElxdwOB8",
            Developed_By: "Ramzan Ahsan"
        };

        res.status(200).json(responseData);

    } catch (error) {
        res.status(500).json({ 
            error: "System Error", 
            Developed_By: "Ramzan Ahsan" 
        });
    }
}
