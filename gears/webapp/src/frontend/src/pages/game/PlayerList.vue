<template>
	<div v-if="showSearch" class="player-search">
		<p class="text-sm mb-4">Sélectionne les joueurs que tu veux inviter.</p>
		<div>
			<input
				type="search"
				v-model="playerSearch"
				placeholder="Rechercher un joueur..."
			/>
			<button @click="clearPlayers">Vider</button>
		</div>
	</div>
	<!-- TODO: use listbox -->
	<ul class="ff-game-players" :class="{ selectable: selectable }">
		<li
			v-for="player in filteredPlayers"
			:key="player.id"
			:class="{ active: selectable && model.includes(player) }"
			@click="selectPlayer(player)"
		>
			<img class="avatar" :src="player.avatar" />
			<span class="username">{{ player.username }}</span>
			<span v-if="showStatus" class="status" :class="player.ready ? 'ready' : 'not-ready'">
				{{ player.ready ? 'Prêt' : 'Pas prêt' }}
			</span>
		</li>
	</ul>
</template>

<script>
export default {
	name: 'GamePlayerList',
	props: {
		players: { type: Array, default: () => [] },
		mode: { 
			type: String, 
			default: 'choice',
			validator: (value) => ['choice', 'list', 'listWithStatus'].includes(value)
		}, // choice, list, listWithStatus
		modelValue: { type: Array, default: () => [] },
	},
	emits: ['update:modelValue'],
	computed: {
		filteredPlayers() {
			return this.players.filter((m) => !this.playerSearch || m.username.toLowerCase().includes(this.playerSearch.toLowerCase()))
		},
		model: {
			get () {
				return this.modelValue
			},
			set (value) {
				this.$emit('update:modelValue', value)
			}
		},
		selectable() {
			return this.mode === 'choice';
		},
		showSearch() {
			return this.mode === 'choice';
		},
		showStatus() {
			return this.mode === 'listWithStatus';
		}
	},
	data() {
		return {
			playerSearch: '',
		}
	},
	methods: {
		clearPlayers() {
			this.model = []
		},
		selectPlayer(player) {
			if (!this.selectable) return;

			const index = this.model.indexOf(player)
			if (index === -1) {
				this.model.push(player)
			} else {
				this.model.splice(index, 1)
			}
		},
	}
}
</script>

<style lang="scss">
ul.ff-game-players {
	flex: 1;
	width: 100%;
	min-height: 120px;
	list-style: none;
	margin: 0;
	padding: 0;
	overflow-y: auto;
	background: #0b1220;
	border-radius: 8px;
	box-shadow: inset 0 1px 2px rgba(0,0,0,0.4);

	li {
		display: flex;
		align-items: center;
		padding: 8px 12px;
		margin: 1px;
		border-radius: 8px;
		transition: background-color 0.2s ease;
		color: #ccc;
		user-select: none;
		-webkit-user-select: none;

		.avatar {
			width: 36px;
			height: 36px;
			border-radius: 50%;
			object-fit: cover;
			margin-right: 10px;
		}

		.username {
			flex: 1;
			color: #dcddde;
			font-size: 0.95rem;
			font-weight: 500;
		}

		.status {
			font-size: 0.95rem;

			&.ready {
				color: green;
			}

			&.not-ready {
				color: red;
			}
		}
	}

	&.selectable li {
		cursor: pointer;

		&:hover,
		&.active {
			background-color: #5865f2;
			color: white;
		}

		&:hover:not(.active) {
			background-color: #3a3d42;
		}
	}
}

.player-search {
	width: 100%;

	div {
		display: flex;
		margin-bottom: 1rem;

		input {
			flex: 1;
			border-radius: 8px;
			background: #0b1220;
			color: #ccc;
			padding: 0.5rem 0.75rem;
		}

		button {
			border-radius: 8px;
			background: #0b1220;
			padding: 0.5rem 0.75rem;
			margin-left: 10px;

			&:hover {
				background-color: #3a3d42;
			}
		}
	}
}
</style>
