<template>
	<!-- TODO: Improve Tailwind CSS -->
	 <!-- TODO: Undo or Reset way -->
  <div class="lobby-wrapper">
    <h1 class="text-4xl font-bold">The Original Pong</h1>

		<transition name="bounce">
			<div v-if="choiceStep === 'mode'" class="flex flex-col items-center gap-6">
				<h2 class="text-2xl">Quand veux-tu jouer ?</h2>
				<div class="flex gap-4">
					<button @click="lobby.scheduled = false" class="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition">
						Démarrer une game maintenant
					</button>
					<button @click="lobby.scheduled = true" class="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 transition">
						Planifier une game
					</button>
				</div>
			</div>
		</transition>

		<transition name="bounce" mode="out-in">
			<div v-if="choiceStep === 'playerCount'" class="flex flex-col items-center gap-6">
				<h2 class="text-2xl">Combien de participants ?</h2>
				<div class="flex gap-4">
					<button
						v-for="n in gameSize"
						:key="n"
						@click="lobby.playerCount = n; createLobby()"
						class="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 transition"
					>
						{{ n }} joueurs
					</button>
				</div>
			</div>
		</transition>

		<transition name="bounce" mode="out-in">
			<div v-if="choiceStep === 'botCount'" class="flex flex-col items-center gap-6">
				<h2 class="text-2xl">Jouer contre des Bots ?</h2>
				<div class="flex gap-4">
					<button
						v-for="n in lobby.playerCount"
						:key="n"
						@click="lobby.botCount = n - 1"
						class="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 transition"
					>
						{{ n === 1 ? 'Non' : `${n - 1} bot${n - 1 > 1 ? 's' : ''}` }}
					</button>
				</div>
			</div>
		</transition>

		<transition name="fade" mode="out-in">
			<div v-if="choiceStep === 'waitLobby'" class="loading">
				<h2>Recherche d’un salon...</h2>
				<div class="spinner"></div>
			</div>
		</transition>

		<transition name="fade" mode="out-in">
			<div v-if="choiceStep === 'dateTime'" class="datetime-wrapper">
				<label>Date & Heure</label>

				<div class="datetime-input">
					<i class="icon">📅</i>
					<input
						type="datetime-local"
						v-model="lobby.scheduledAt"
						:min="new Date(Date.now() + 60000).toISOString().slice(0,16)"
					/>
					<small
						v-if="lobby.scheduledAt && new Date(lobby.scheduledAt) <= new Date()"
						class="text-red-400"
					>
						La date doit être dans le futur.
					</small>
					<button
						v-else-if="lobby.scheduledAt"
						@click="lobby.scheduledAt = new Date(lobby.scheduledAt)"
						class="ml-4 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 transition"
					>
						Valider
					</button>
				</div>
			</div>
		</transition>

		<transition name="fade" mode="out-in">
			<div
				v-if="choiceStep === 'invitePlayers'"
				class="w-full max-w-xl bg-gray-800 p-6 rounded-2xl invite-modal"
			>
				<h2 class="text-2xl mb-4">Inviter des participants</h2>
				<template v-if="!lobby.inviteWithLink">
					<Players v-model="lobby.players" :players="members.filter((m) => m.id !== user.id)" mode="choice" />
				</template>

				<div class="mt-4 flex flex-col gap-2">
					<template v-if="!lobby.inviteWithLink">
						<button
							@click="createLobby"
							:disabled="lobby.players.length !== lobby.playerCount - 1"
							class="px-6 py-3 bg-indigo-600 disabled:opacity-40 invite-button"
						>
							Inviter & Continuer
						</button>
						<small
							v-if="lobby.players && lobby.players.length"
							class="text-xs text-gray-400"
						>
							{{ lobby.players.length }} invité(s) sélectionné(s) sur {{ lobby.playerCount - 1 }}
						</small>
					</template>
					<button
						v-if="!lobby.players.length"
						@click="lobby.inviteWithLink = true; createLobby()"
						:disabled="!!lobby.inviteLink"
						class="px-6 py-3 bg-indigo-600 disabled:opacity-40 invite-button"
					>
						Ou partage leur un lien d'invitation
					</button>
					<div
						v-if="lobby.inviteLink"
						class="flex items-center gap-2 text-xs"
					>
						<input
							readonly
							:value="lobby.inviteLink"
							class="flex-1 bg-gray-700 px-3 py-2 select-all"
						/>
						<!-- TODO <button
							@click="navigator.clipboard.writeText(lobby.inviteLink)"
							class="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 rounded"
						>
							Copier
						</button>-->
					</div>
				</div>
			</div>
		</transition>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import Players from './PlayerList.vue';

export default {
	name: 'GameLobby',
	components: {
		Players,
	},
	computed: {
		...mapState('account', ['socket', 'user']),
		...mapState('chat', ['members']),
		choiceStep() {
			if (this.lobby.scheduled === null && this.lobby.playerCount === 0) {
				return 'mode';
			} else if (this.lobby.scheduled === true && (this.lobby.scheduledAt === null || typeof this.lobby.scheduledAt === "string")) {
				return 'dateTime';
			} else if (this.lobby.scheduled === true && typeof this.lobby.scheduledAt === "object" && this.lobby.playerCount === 0) {
				//this.lobby.botCount = 0;
				return 'playerCount';
			} else if (this.lobby.scheduled === false && this.lobby.playerCount === 0) {
				this.lobby.botCount = 0;
				return 'playerCount';
			} else if (this.lobby.playerCount > 0 && this.lobby.botCount === null && this.lobby.scheduled) {
				return 'botCount';
			} else if (this.lobby.playerCount > 0 && this.lobby.botCount >= 0) {
				if (this.lobby.scheduled) return 'invitePlayers';
				return this.waitLobby ? 'waitLobby' : 'lobby';
			}
		}
	},
	data() {
		return {
			gameSize: [2, 3, 4, 6, 8, 10, 12],
			waitLobby: false,
			lobby: {
				inviteWithLink: false,
				scheduled: null,
				scheduledAt: null,
				botCount: null,
				playerCount: 0,
				players: [],
			}
		}
	},
	beforeUnmount() {
		this.socket.off('lobby:joined');
	},
	mounted() {
		this.setupLobby();
		this.loadMembers();
	},
	methods: {
		...mapActions('chat', ['loadMembers']),
		createLobby() {
      this.socket.emit('lobby:create', this.lobby);
      this.waitLobby = true;
    },
  	setupLobby() {
			this.socket.on('lobby:joined', (lobby) => {
				this.waitLobby = false;
				if (lobby.scheduledAt === null) {
					// Redirect to the game page
					return this.$router.push({ path: `/game/${lobby.id}` });
				}

				this.lobby.inviteLink = lobby.inviteLink;
			})
		},
  }
}
</script>

<style lang="scss" scoped>
.lobby-wrapper {
	height: 100vh;
	background: #0b1220;
	color: #fff;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 2rem;
	gap: 2rem;
}

.datetime-wrapper {
	text-align: left;
	margin: 20px auto;
	font-family: inherit;

	label {
		display: block;
		margin-bottom: 6px;
		font-size: 1rem;
		color: #dce3ff;
	}

	.datetime-input {
		position: relative;
		background: rgba(255,255,255,0.06);
		border: 1px solid rgba(255,255,255,0.15);
		backdrop-filter: blur(6px);
		padding: 10px 14px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		transition: 0.2s ease;

		&:hover {
			background: rgba(255,255,255,0.10);
		}

		&:focus-within {
			border-color: #4fa3ff;
			box-shadow: 0 0 10px rgba(79,163,255,0.6);
		}

		.icon {
			margin-right: 8px;
			font-size: 20px;
			opacity: 0.8;
		}

		input {
			background: transparent;
			border: none;
			color: white;
			width: 100%;
			font-size: 1rem;

			&:focus {
				outline: none;
			}
		}
	}
}

.invite-modal {
	input {
		border-radius: 8px;

		&.member-search {
			background: #0b1220;
			color: #ccc;
		}
	}

	button {
		border-radius: 8px;

		&.invite-button {
			&:hover {
				background-color: #5865f2;
			}
		}
	}

	ul {
		flex: 1;
		list-style: none;
		margin: 0;
		padding: 0;
		max-height: 280px;
		overflow-y: auto;
		background: #0b1220;
		border-radius: 8px;
		box-shadow: inset 0 1px 2px rgba(0,0,0,0.4);
	}

	li {
		display: flex;
		align-items: center;
		padding: 8px 10px;
		margin-bottom: 2px;
		border-radius: 8px;
		transition: background-color 0.2s ease;
		cursor: pointer;
		color: #ccc;
		user-select: none;
		-webkit-user-select: none;

		&:hover,
		&.active {
			background-color: #5865f2;
			color: white;
		}

		&:hover:not(.active) {
			background-color: #3a3d42;
		}

		.avatar {
			width: 36px;
			height: 36px;
			border-radius: 50%;
			object-fit: cover;
			margin-right: 10px;
		}

		.username {
			color: #dcddde;
			font-size: 0.95rem;
			font-weight: 500;
		}
	}
}

button { cursor: pointer; }

.bounce-enter-active {
	animation: bounce-in 0.6s;
}
.bounce-leave-active {
	animation: bounce-in 0.4s reverse;
}
@keyframes bounce-in {
	0% { transform: scale(0); }
	50% { transform: scale(1.25); }
	100% { transform: scale(1); }
}

.spinner {
	width: 40px;
	height: 40px;
	border: 4px solid #ccc;
	border-top-color: #4fa3ff;
	border-radius: 50%;
	animation: spin 0.7s linear infinite;
	margin: 20px auto;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}
</style>
