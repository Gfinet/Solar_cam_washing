import fp from "fastify-plugin"


export async function getValidMieleToken(userId, server) {
	// 1. Chercher le token en BDD
	const tokenRecord = await server.prisma.miele_Token.findUnique({
		where: { userId: userId }
	});

	if (!tokenRecord) {
		throw new Error("Aucun compte Miele associé");
	}

	const today = new Date();
	if (tokenRecord.expiresAt > new Date(today.getTime() + 60000)) {
		return tokenRecord.accessToken;
	};
	
	try {
		const response = await fetch('https://api.mcs3.miele.com/thirdparty/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: process.env.MIELE_ID,
				client_secret: process.env.MIELE_SECRET,
				refresh_token: tokenRecord.refreshToken,
				grant_type: 'refresh_token'
			})
		});
		const data = await response.json();

		if (data.error) {
			throw new Error(`Error Miele Refresh: ${data.message}`);
		}
		const nouvelExpiracy = new Date();
		nouvelExpiracy.setSeconds(nouvelExpiracy.getSeconds() + data.expires_in);

		const updatedRecord = await server.prisma.miele_Token.update({
			where: { userId: userId },
			data: {
				accessToken: data.access_token,
				refreshToken: data.refresh_token || tokenRecord.refreshToken, // Parfois Miele ne renvoie pas de nouveau refresh token, on garde l'ancien au cas où
				expiresAt: nouvelExpiracy
			}
		});

		return updatedRecord.accessToken;

	} catch (error) {
		throw new Error("Session Miele expirée, veuillez vous reconnecter.");
	}
}

export default fp(async (server)=>{
    
})