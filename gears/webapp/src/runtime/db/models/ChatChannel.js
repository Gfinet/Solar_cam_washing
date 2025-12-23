const { DataTypes, Op } = require("sequelize");

module.exports = {
	name: "ChatChannel",
	schema: {
		id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
		type: { type: DataTypes.ENUM(["DM", "groupDM", "publicThread", "privateThread"]), allowNull: false },
		name: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.STRING, defaultValue: "" },
		createdAt: { type: DataTypes.DATE },
		updatedAt: { type: DataTypes.DATE },
		// TODO: lastReadMsgId
	},
	associations: function (M) {
		this.belongsTo(M.User, { foreignKey: "ownerId", as: "owner" });
		this.belongsToMany(M.User, { through: "ChatMember", as: "members", foreignKey: "channelId" });
		this.hasMany(M.ChatMessage, { foreignKey: "channelId", as: "messages" });
	},
	finders: function (M) {
		return {
			static: {
				byId: async (id) => {
					return this.findOne({ where: { id } });
				},
				byOwner: async (User) => {
					return this.findAll({
						include: [
							{
								model: M.User,
								as: "owner",
								where: { id: User.id },
								attributes: ["id"],
							},
						],
					});
				},
				forMember: async (User) => {
					return this.findAll({
						where: {
							[Op.or]: [{ type: "publicThread" }, { "$members.id$": User.id }],
						},
						//attributes: ['id', 'type', 'name', 'description', 'createdAt', ''],
						include: [
							{
								model: M.User,
								as: "members",
								attributes: ["hashid", "id", "username", "avatar"],
								//where: { id: User.id },
								required: false,
							},
							{
								model: M.User,
								as: "owner",
								attributes: ["hashid", "id"],
								required: false,
							},
						],
						distinct: true,
					});
				},
			},
		};
	},
};
