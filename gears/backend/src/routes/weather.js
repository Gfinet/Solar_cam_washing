


export default async function auth(server) {

    server.get('/temptoday', async (request, reply) => {
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        start.setHours(21, 59, 59, 999);
        const end = new Date()
        end.setHours(23, 0, 0, 0);
        // console.log(now, start, end, "\n", now.getDate())
        const today = await server.prisma.weather_Forecast.findMany({ where: { time: {gte : start, lte: end }}, orderBy: {time: 'asc'}})
        // console.log("Waza", today)
        return {success : true, message: today}
    })
}