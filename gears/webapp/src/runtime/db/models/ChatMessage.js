const { DataTypes } = require("sequelize");

module.exports = {
	name: "ChatMessage",
	schema: {
		id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
		content: { type: DataTypes.TEXT, allowNull: false },
		editedAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
		deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
	},
	options: {
		updatedAt: false,
	},
	associations: function (M) {
		this.belongsTo(M.ChatChannel, { foreignKey: "channelId", as: "channel" });
		this.belongsTo(M.User, { foreignKey: "userId", as: "author" });
	},
	finders: function (M) {
		return {
			static: {
				byId: async (id) => {
					return this.findOne({
						where: { id },
						include: [
							{
								model: M.User,
								as: "author",
								attributes: ["id", "username", "avatar"],
							},
						],
					});
				},
				byChannelId: async (id) => {
					// TODO: pagination
					return this.findAll({
						where: { channelId: id, deleted: false },
						include: [
							{
								model: M.User,
								as: "author",
								attributes: ["id", "username", "avatar"],
							},
						],
						order: [["createdAt", "ASC"]],
					});
				},
			},
		};
	},
};
