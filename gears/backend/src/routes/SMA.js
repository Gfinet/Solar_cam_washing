import fp from 'fastify-plugin' // Aide à rendre prisma accessible partout


const base_url = "https://sandbox.smaapis.de/monitoring/v1/devices/14496865/lean"

let uri = "v1/devices/14496865/lean"



export default async function getVal(server)
{
    server.get('/sma', async (request, reply)=>
    {    
        try
        {
            const response = fetch (base_url, {
                method: 'GET',
                headers: {
                'Authorization': 'Bearer test1234', // À récupérer sur le Swagger
                'Accept': 'application/json'
                }
            })
            if (!response.ok) {
                throw new Error(`Erreur: ${response.status}`);
            }

            const data = await response.json();
            console.log("Installations trouvées :", data);
        } 
        catch (error) 
        {
            console.error("Erreur lors de l'appel API :", error);
        }
        return { success: true, message: data }
    })
}