module.exports = function (app) {
	app.addSchema({
		$id: "ChatMember",
		type: "object",
		properties: {
			id: { type: "string" },
			username: { type: "string" },
			avatar: { type: "string" },
		},
	});

	app.addSchema({
		$id: "ChatMemberList",
		type: "array",
		items: {
			$ref: "ChatMember",
		},
	});

	function memberProfile(user) {
		const result = {
			id: user.hashid,
		};
		["username", "avatar"].forEach((p) => {
			result[p] = user[p];
		});
		return result;
	}

	return {
		memberProfile,
	};
};
