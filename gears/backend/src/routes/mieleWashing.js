

export default async function miele(server) {
    
    server.post('/wash/list', async (request, reply) =>{
        const number = request.body
        const line = await server.prisma.washing_Program.findMany( {take: number, orderBy: { time: 'desc'}})
        if (line)
            return { success: true, message: line }
        else
            return { success: false, message: "No Data" }
    })

}