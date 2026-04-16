import fp from 'fastify-plugin'
import { fetchWeatherApi } from "openmeteo";


export default fp(async (server) => {
    const params = {
        latitude: 50.89,
        longitude: 4.37,
        hourly: "temperature_2m",
    };
    const url = "https://api.open-meteo.com/v1/forecast";
    // const responses = await fetchWeatherApi(url, params);
    const responses = await fetch("https://api.open-meteo.com/v1/forecast?latitude=50.89&longitude=4.37&hourly=temperature_2m");

    // Process first location. Add a for-loop for multiple locations or weather models
    // const response = responses[0];
    const data = await responses.json();
    console.log(data)

    // Attributes for timezone and location
    // const latitude = response.latitude();
    // const longitude = response.longitude();
    // const elevation = response.elevation();
    // const utcOffsetSeconds = response.utcOffsetSeconds();

    console.log(
        `\nCoordinates: ${params.latitude}°N ${params.longitude}°E`,
        // `\nElevation: ${elevation}m asl`,
        // `\nTimezone difference to GMT+1: ${utcOffsetSeconds}s`,
    );

    
    // const hourly = response.hourly() | null;

    // // Note: The order of weather variables in the URL query and the indices below need to match!
    // const weatherData = {
    //     hourly: {
    //     time: Array.from(
    //         { length: (Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval() }, 
    //         (_ , i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
    //     ),
    //     temperature_2m: hourly.variables(0).valuesArray(),
    //     },
    // };

    // // The 'weatherData' object now contains a simple structure, with arrays of datetimes and weather information
    // console.log("\nHourly data:\n", weatherData.hourly)
})