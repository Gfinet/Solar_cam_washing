import fp from 'fastify-plugin'
import { fetchWeatherApi } from "openmeteo";
import cron from 'node-cron';


export default fp(async (server) => {
    if (server.prisma.weatherForecast.count === 0)
        await fetchWeatherData(server);
    cron.schedule('0 12 * * *', async () => {
        console.log('Il est midi ! Récupération de la météo...');
        await fetchWeatherData(server);
        }, 
        {
            timezone: "Europe/Paris" // Très important pour le changement d'heure !
    });

    async function fetchWeatherData(server) {
        const params = {
            latitude: 50.89,
            longitude: 4.37,
            hourly: "temperature_2m",
        };
        const url = "https://api.open-meteo.com/v1/forecast";
        // const responses = await fetchWeatherApi(url, params);
        const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=50.89&longitude=4.37&hourly=temperature_2m&timezone=Europe/Paris");
        if (!response.ok) throw new Error(data.error || 'Failed to fetch weather data');
        // Process first location. Add a for-loop for multiple locations or weather models
        // const response = response[0];
        const data = await response.json();
        // setHourlyWeatherResults(data);
        const hourlyData = data.hourly.time.map((t, index) => {
            return {
                time: t,
                temp: data.hourly.temperature_2m[index]
            };
        });
        console.log(data)
        for (let i = 0; i < data.hourly.time.length; i++) {
            await server.prisma.weatherForecast.upsert({
                where: { 
                    time: new Date(data.hourly.time[i]) 
                },
                update: {
                    temp: data.hourly.temperature_2m[i]
                },
                create: {
                    time: new Date(data.hourly.time[i]),
                    temp: data.hourly.temperature_2m[i]
                }
            });
        }
    }
})