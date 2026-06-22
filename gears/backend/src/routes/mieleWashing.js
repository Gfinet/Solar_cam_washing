import 'dotenv/config';

export default async function miele(server) {
    
    server.post('/wash/list', async (request, reply) =>{
        const number = request.body
        const line = await server.prisma.washing_Program.findMany( {take: number, orderBy: { time: 'desc'}, include: {author: {select: {username: true}}}})
        if (line)
            return { success: true, message: line }
        else
            return { success: false, message: "No Data" }
    })
    server.get('/wash/list', async (request, reply) =>{
        const line = await server.prisma.washing_Program.findMany( {take: 5, orderBy: { time: 'desc'}, include: {author: {select: {username: true}}}})
        if (line)
            return { success: true, message: line }
        else
            return { success: false, message: "No Data" }
    })

    server.get('/miele/callback', 
    async (request, reply) =>{
        const {code, state} = request.query
        

        const decoded = server.jwt.verify(state);
        const userId = decoded.id;

        if (!code) return reply.status(400).send({ error: "Code manquant" });
        
        const response = await fetch('https://api.mcs3.miele.com/thirdparty/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.MIELE_ID,
            client_secret: process.env.MIELE_SECRET,
            code: code,
            redirect_uri: process.env.MIELE_REDIRECT_URI,
            grant_type: 'authorization_code'
        })
        });
        const tokens = await response.json();
        // console.log("tok tok", tokens, "\n", process.env.MIELE_ID, "\n", process.env.MIELE_SECRET)
        if (tokens.error)
        {
            console.log(tokens.message + " - " + tokens.error)
            return reply.redirect('/schedule?miele=failure')
        }
        const today = new Date()
        today.setHours(today.getHours() + 2)
        await server.prisma.miele_Token.upsert({
            where: { userId: userId }, //TO DO changer userId en Id utilisateur
            update: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: new Date(today + tokens.expires_in * 1000)
            },
            create: {
            userId: userId,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: new Date(today + tokens.expires_in * 1000)
            }
        });
        console.log("Connexion à Miele réussie et sauvegardée !")
        return reply.redirect('/schedule?miele=success');
    })

    server.get('/miele/connect', 
    { preHandler: [server.auth] }, 
    async (request, reply) => {
        try {
            const stateToken = server.jwt.sign(
            { id: request.user.id, purpose: 'miele-auth' }, 
            { expiresIn: '15m' }
            );
            const clientId = process.env.MIELE_ID;
            const redirectUri = process.env.MIELE_REDIRECT_URI;
            const authUrl = `https://api.mcs3.miele.com/thirdparty/login?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${stateToken}&scope=all&language=fr`;
            return {url :authUrl};
        } 
        catch (error) {
            return {url : '/dashboard', message : "Error"}
        }
        
    })

    server.get('/miele/devices', 
    { preHandler: [server.auth] }, 
    async (request, reply) => {
        // 1. Récupère le token en DB via Prisma
        const userId = request.user.id;
        // const tokenData = await server.prisma.miele_Token.findFirst();
        const tokenData = await server.prisma.miele_Token.findUnique({ where: { id : userId }})
        //TO DO pas le premier mais celui lier a l'utilisateur
        
        const response = await fetch('https://api.mcs3.miele.com/v1/short/devices?language=fr', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenData.accessToken}`,
                'Content-Type': 'application/json',
                'Accept-Language': 'fr-FR' // Pour avoir les noms des programmes en français !
            }
        });

        const devices = await response.json();
        const washDevices = []
        devices.forEach(element => {
            if (element.type === "Washing machine")
                washDevices.push(element)
        /*
        element = {
            "fabNumber": "000148508574",
            "state": "Waiting to start",
            "type": "Washing machine",
            "deviceName": "",
            "details": "https://api.mcs3.miele.com/v1/devices/000148508574"
        }
        */
        });
        return testDevicesMiele;//washDevices;
    });

    server.get('/miele/device/:deviceId', //?language=fr
    { preHandler: [server.auth] },
    async (request, reply) => {

        //TODO quand la machine est enregistrée
        // const userId = request.user.id;
        // // const tokenData = await server.prisma.miele_Token.findFirst();
        // const tokenData = await server.prisma.miele_Token.findUnique({ where: { id : userId }})
        // //TO DO pas le premier mais celui lier a l'utilisateur
        
        // const response = await fetch(`https://api.mcs3.miele.com/v1/device/${deviceId}?language=fr`, {
        //     method: 'GET',
        //     headers: {
        //         'Authorization': `Bearer ${tokenData.accessToken}`,
        //         'Content-Type': 'application/json',
        //         'Accept-Language': 'fr-FR' // Pour avoir les noms des programmes en français !
        //     }
        // });

        // const devices = await response.json();
        return testDeviceMiele;
    });


    // server.put('https://api.mcs3.miele.com/v1/devices/){deviceId}/actions', async (request, reply) => {

    // })
    const testDevicesMiele = [{"fabNumber": "000137439624","state": "Off","type": "Oven","deviceName": "","details": "https://api.mcs3.miele.com/v1/devices/000137439624"},{"fabNumber": "000105666767","state": "In use","type": "Dishwasher","deviceName": "","details": "https://api.mcs3.miele.com/v1/devices/000105666767"},{"fabNumber": "000148508574","state": "Waiting to start","type": "Washing machine","deviceName": "","details": "https://api.mcs3.miele.com/v1/devices/000148508574"},{"fabNumber": "007109230215","state": "In use","type": "Refrigerator","deviceName": "","details": "https://api.mcs3.miele.com/v1/devices/007109230215"}]
    const testDeviceMiele = { 
        "ident": {
            "type": {
                "key_localized": "Device type",
                "value_raw": 1,
                "value_localized": "Washing machine"
            },
            "deviceName": "",
            "protocolVersion": 4,
            "deviceIdentLabel": {
                "fabNumber": "000148508574",
                "fabIndex": "10",
                "techType": "WWV980",
                "matNumber": "10708820",
                "swids": ["4850","20457","20449","25260","20450","5012","25314","25205","25313","25191"]
            }
            ,"xkmIdentLabel": {
                "techType": "EK037",
                "releaseVersion": "03QC2"
            }},
        "state": {
            "ProgramID": {
                "value_raw": 1,
                "value_localized": "Cottons",
                "key_localized": "Program name"
            },
            "status": {
                "value_raw": 4,//"value_raw": 5,
                "value_localized": "Waiting to start",//"value_localized": "Running",
                "key_localized": "status"
            },
            "programType": {
                "value_raw": 1,
                "value_localized": "Own programme",
                "key_localized": "Program type"
            },
            "programPhase": {
                "value_raw": 256,
                "value_localized": "",
                "key_localized": "Program phase"
            },
            "remainingTime": [2,14],
            "startTime": [1,34],
            "targetTemperature": [{"value_raw": 6000,"value_localized": 60,"unit": "Celsius"},{"value_raw": -32768,"value_localized": null,"unit": "Celsius"},{"value_raw": -32768,"value_localized": null,"unit": "Celsius"}],
            "temperature": [{"value_raw": -32768,"value_localized": null,"unit": "Celsius"},{"value_raw": -32768,"value_localized": null,"unit": "Celsius"},{"value_raw": -32768,"value_localized": null,"unit": "Celsius"}],
            "signalInfo": false,
            "signalFailure": false,
            "signalDoor": false,
            "remoteEnable": {
                "fullRemoteControl": true,
                "smartGrid": true,
                "mobileStart": false
            },
            "ambientLight": null,
            "light": null,
            "elapsedTime": [0,0],
            "spinningSpeed": {
                "unit": "rpm",
                "value_raw": 1600,
                "value_localized": "1600",
                "key_localized": "Spin speed"
            },
            "dryingStep": {
                "value_raw": null,
                "value_localized": "",
                "key_localized": "Drying level"
            },
            "ventilationStep": {
                "value_raw": null,
                "value_localized": "",
                "key_localized": "Fan level"
            },
            "plateStep": [],
            "ecoFeedback": {
                "currentWaterConsumption": {"unit": "l","value": 0},
                "currentEnergyConsumption": {"unit": "kWh","value": 0},
                "waterForecast": 0.3,"energyForecast": 0.4},
                "batteryLevel": null}}
}


