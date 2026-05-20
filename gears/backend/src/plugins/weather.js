import fp from 'fastify-plugin'
import { fetchWeatherApi } from "openmeteo";
import cron from 'node-cron';


export default fp(async (server) => {
    const count = await server.prisma.weather_Forecast.count();
    if (count === 0)
    {
        console.log("FIRST")
        await fetchWeatherData(server);
    }
    cron.schedule('0 6 * * *', async () => {
        console.log('Il est 6h ! Récupération de la météo...');
        await fetchWeatherData(server);
        }, 
        {
            timezone: "Europe/Paris" // Très important pour le changement d'heure !
    });

    async function fetchWeatherData(server) {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=50.89&longitude=4.37&hourly=temperature_2m,shortwave_radiation&timezone=Europe/Paris";
        const response = await fetch(url);
        if (!response.ok) throw new Error(data.error || 'Failed to fetch weather data');
        else console.log("connection to open-meteo ok");

        const data = await response.json();
        for (let i = 0; i < data.hourly.time.length; i++) {
            await server.prisma.weather_Forecast.upsert({
                where: { 
                    time: new Date(data.hourly.time[i]) 
                },
                update: {
                    temp: data.hourly.temperature_2m[i]
                },
                create: {
                    time: new Date(data.hourly.time[i]),
                    temp: data.hourly.temperature_2m[i],
                    SolarRay: data.hourly.shortwave_radiation[i]
                }
            });
        }
    }
})