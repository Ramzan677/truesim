const axios = require('axios');

export default async function handler(req, res) {
    // --- CORS Headers Start ---
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allows all domains
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight request (OPTIONS)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    // --- CORS Headers End ---

    const { number } = req.query;

    if (!number) {
        return res.status(400).json({ error: "Please provide a phone number." });
    }

    try {
        // 1. Fetch from Truecaller API
        const truecallerRes = await axios.get(`https://sbsakib.eu.cc/apis/truecaller?key=Test&number1=${number}`);
        const truecallerName = truecallerRes.data?.name || "Not Found";

        // 2. Fetch from Sim Data API
        const simDataRes = await axios.get(`https://ramzan-simdata.deno.dev/?number=${number}`);
        const simData = simDataRes.data || {};

        // 3. Construct Clean Response
        const responseData = {
            Status: "Success",
            Name: truecallerName !== "Not Found" ? truecallerName : (simData.name || "N/A"),
            Number: number,
            CNIC: simData.cnic || "N/A",
            Address: simData.adress || "N/A",
            Network: simData.network || "N/A",
            WhatsApp_Group: "https://chat.whatsapp.com/LoafyPWMGOv88oElxdwOB8",
            Developed_By: "Ramzan Ahsan"
        };

        res.status(200).json(responseData);

    } catch (error) {
        res.status(500).json({ 
            error: "API Connection Error",
            Developed_By: "Ramzan Ahsan"
        });
    }
}
