<template>
  <div class="ff-chat-channel-item">
		<span class="name">
			<template v-if="channel.type === 'publicThread'">
				<img class="channel-icon" src="./icons/channel.svg" /> {{ channel.name }}
			</template>

			<template v-else-if="channel.type === 'privateThread'">
				<img class="channel-icon" src="./icons/private-channel.svg" /> {{ channel.name }}
			</template>

			<template v-else-if="channel.type === 'DM'">
				<img 
					:src="channel.members[0].avatar" 
					alt="avatar"
					class="dm-avatar"
				/>
				{{ channel.members[0].username }}
			</template>

			<template v-else-if="channel.type === 'groupDM'">
				<span class="group-avatar-stack">
					<img
						v-for="(user, i) in channel.members.slice(0, 3)" 
						:key="i"
						:src="user.avatar"
						class="group-avatar"
					/>
				</span>
				{{ channel.name || channel.members.map((u) => u.username).join(', ') }}
			</template>
		</span>

		<span 
			class="notif-badge"
			:data-count="channel.unreadMessages || 0"
			:class="{ 'red-dot': channel.unreadMessages === true }"
		></span>
	</div>
</template>

<script>
export default {
	name: 'ChatChannelItem',
	props: ['channel'],
}
</script>

<style lang="scss" scoped>
.ff-chat-channel-item {
	width: 100%;
	display: flex;
	align-items: center;
	position: relative;
  padding-right: 26px;

	.name {
		display: flex;
		align-items: center;
		gap: 6px;
		user-select: none;
		-webkit-user-select: none;
	}

	.channel-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		opacity: 0.85;
	}

	.dm-avatar {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		margin-right: 6px;
		vertical-align: middle;
	}

	.group-avatar-stack {
		display: inline-flex;
		align-items: center;
		margin-right: 6px;
		position: relative;
	}

	.group-avatar {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		border: 1px solid #222;
		margin-left: -6px;
		&:first-child {
			margin-left: 0;
		}
	}

	.notif-badge {
		position: absolute;
		right: 10px;
		top: 50%;
		transform: translateY(-50%);

		min-width: 8px;
		height: 8px;

		background: #f04747;
		border-radius: 999px;

		display: flex;
		align-items: center;
		justify-content: center;

		font-size: 0.70rem;
		color: white;
		font-weight: bold;

		padding: 0 6px;

		opacity: 0;
		transition: opacity 0.2s ease, transform 0.2s ease;

		&.red-dot {
			width: 10px;
			height: 10px;
			padding: 0;
			opacity: 1;
		}

		&[data-count]:not([data-count="0"]) {
			opacity: 1;

			&:not(.red-dot) {
				min-width: 16px;
				height: 16px;
				transform: translateY(-50%) scale(1);
			}
		}

		&:not(.red-dot)::before {
			content: attr(data-count);
		}
	}
}
</style>
