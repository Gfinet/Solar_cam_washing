import 'dotenv/config';
import { getValidMieleToken } from '../plugins/mieleWashing.js';

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

    server.get('/miele/token', 
    { preHandler: [server.auth] },
    async (request, reply) =>{
        const userId = request.user.id;
        const mieleTok = await server.prisma.user.findUnique({
            where : {id : userId}, 
            select : {
                mieleToken : true
        }})
        // console.log("TOKMIELE", mieleTok)
        return { success: (mieleTok.mieleToken !== null) }

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
        const userId = request.user.id;
        const tokenData = await getValidMieleToken(userId, server)
        
        const response = await fetch('https://api.mcs3.miele.com/v1/short/devices?language=fr', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenData}`,
                'Content-Type': 'application/json',
                'Accept-Language': 'fr-FR' // Pour avoir les noms des programmes en français !
            }
        });

        const devices = await response.json();
        // console.log("WAZIII", devices)
        if (response.ok) return devices;
        return [];
    });

    server.get('/miele/devices/:deviceId', //?language=fr
    { preHandler: [server.auth] },
    async (request, reply) => {

        //TODO quand la machine est enregistrée
        const { deviceId } = request.params;
        const userId = request.user.id;
        const tokenData = await getValidMieleToken(userId, server)        

        const response = await fetch(`https://api.mcs3.miele.com/v1/devices/${deviceId}?language=fr`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenData}`,
                'Content-Type': 'application/json',
                'Accept-Language': 'fr-FR' // Pour avoir les noms des programmes en français !
            }
        });

        const devices = await response.json();
        
        if (response.ok) return devices; //testDeviceMiele;
        return []; 
    });

    server.get('/miele/devices/:deviceId/programs', //?language=fr
    { preHandler: [server.auth] },
    async (request, reply) => {

        //TODO quand la machine est enregistrée
        const { deviceId } = request.params;
        const userId = request.user.id;
        const tokenData = await getValidMieleToken(userId, server)        

        const response = await fetch(`https://api.mcs3.miele.com/v1/devices/${deviceId}/programs?language=fr`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenData}`,
                'Content-Type': 'application/json',
                'Accept-Language': 'fr-FR' // Pour avoir les noms des programmes en français !
            }
        });

        const devices = await response.json();
        // console.log(response, "\n\n", devices)
        
        if (response.ok) return devices; //testDeviceMiele;
        return []; 
    });
    

    server.put('/miele/devices/:deviceId/actions', //?language=fr
    { preHandler: [server.auth] },
    async (request, reply) => {

        const { deviceId } = request.params;
        console.log("BODY",request.body)
        const userId = request.user.id;
        const tokenData = await getValidMieleToken(userId, server)        

        const response = await fetch(`https://api.mcs3.miele.com/v1/devices/${deviceId}/actions`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${tokenData}`,
                'Content-Type': 'application/json',
                'Accept-Language': 'fr-FR',
            },
            body : JSON.stringify(request.body),
        });

        if (response.status !== 204) await response.json();
        
        if (response.status) return { success: true }; //testDeviceMiele;
        return { success: false }; 
    });
}

    // server.put('https://api.mcs3.miele.com/v1/devices/){deviceId}/actions', async (request, reply) => {

    // })
    


