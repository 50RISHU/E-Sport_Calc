export const tournaments = [
	{
		tournamentId: 1,
		name: 'Battle Arena Championship',
		game: 'BGMI',
		date: '2025-02-18',

		teams: [
			{
				teamId: 1,
				name: 'Team Alpha',
				players: ['A1', 'A2', 'A3'],
				points: 0
			},
			{
				teamId: 2,
				name: 'Team Nova',
				players: ['N1', 'N2', 'N3'],
				points: 0
			},
			{
				teamId: 3,
				name: 'Dark Knights',
				players: ['D1', 'D2', 'D3'],
				points: 0
			}
		],

		matches: [
			{
				matchId: 1,
				teamA: 1,
				teamB: 2,
				scoreA: null,
				scoreB: null,
				winner: null
			},
			{
				matchId: 2,
				teamA: 2,
				teamB: 3,
				scoreA: null,
				scoreB: null,
				winner: null
			},
			{
				matchId: 3,
				teamA: 1,
				teamB: 3,
				scoreA: null,
				scoreB: null,
				winner: null
			}
		]
	},

	{
		tournamentId: 2,
		name: 'Pro Legends Cup',
		game: 'Free Fire',
		date: '2025-02-20',

		teams: [
			{ teamId: 1, name: 'Blaze Force', players: ['B1', 'B2', 'B3'], points: 0 },
			{ teamId: 2, name: 'Shadow Ops', players: ['S1', 'S2', 'S3'], points: 0 },
			{ teamId: 3, name: 'Rage Squad', players: ['R1', 'R2', 'R3'], points: 0 }
		],

		matches: [
			{ matchId: 1, teamA: 1, teamB: 2, scoreA: null, scoreB: null, winner: null },
			{ matchId: 2, teamA: 2, teamB: 3, scoreA: null, scoreB: null, winner: null },
			{ matchId: 3, teamA: 1, teamB: 3, scoreA: null, scoreB: null, winner: null }
		]
	},

	{
		tournamentId: 3,
		name: 'Power Arena Masters',
		game: 'Valorant',
		date: '2025-01-12',
		teams: [
			{ teamId: 1, name: 'Phantom Squad', players: ['P1', 'P2', 'P3'], points: 0 },
			{ teamId: 2, name: 'Viper Elite', players: ['V1', 'V2', 'V3'], points: 0 }
		],
		matches: [{ matchId: 1, teamA: 1, teamB: 2, scoreA: null, scoreB: null, winner: null }]
	},

	{
		tournamentId: 4,
		name: 'Hero Battle Showdown',
		game: 'MLBB',
		date: '2025-03-02',
		teams: [
			{ teamId: 1, name: 'Stormbreakers', players: ['S1', 'S2', 'S3'], points: 0 },
			{ teamId: 2, name: 'Night Wolves', players: ['W1', 'W2', 'W3'], points: 0 },
			{ teamId: 3, name: 'Dragons Clash', players: ['D1', 'D2', 'D3'], points: 0 }
		],
		matches: [
			{ matchId: 1, teamA: 1, teamB: 2, scoreA: null, scoreB: null, winner: null },
			{ matchId: 2, teamA: 2, teamB: 3, scoreA: null, scoreB: null, winner: null }
		]
	},

	{
		tournamentId: 5,
		name: 'Ultimate Esports League',
		game: 'PUBG',
		date: '2025-04-15',
		teams: [
			{ teamId: 1, name: 'Steel Titans', players: ['ST1', 'ST2', 'ST3'], points: 0 },
			{ teamId: 2, name: 'Blitzkrieg', players: ['BK1', 'BK2', 'BK3'], points: 0 }
		],
		matches: [{ matchId: 1, teamA: 1, teamB: 2, scoreA: null, scoreB: null, winner: null }]
	},

	{
		tournamentId: 6,
		name: 'Royal Rumble Clash',
		game: 'COD Mobile',
		date: '2025-05-10',
		teams: [
			{ teamId: 1, name: 'Reaper Unit', players: ['RU1', 'RU2', 'RU3'], points: 0 },
			{ teamId: 2, name: 'Ghost Tactics', players: ['GT1', 'GT2', 'GT3'], points: 0 },
			{ teamId: 3, name: 'Bravo Squad', players: ['BS1', 'BS2', 'BS3'], points: 0 }
		],
		matches: [
			{ matchId: 1, teamA: 1, teamB: 2, scoreA: null, scoreB: null, winner: null },
			{ matchId: 2, teamA: 2, teamB: 3, scoreA: null, scoreB: null, winner: null },
			{ matchId: 3, teamA: 3, teamB: 1, scoreA: null, scoreB: null, winner: null }
		]
	},

	{
		tournamentId: 7,
		name: 'Arena Storm Cup',
		game: 'BGMI',
		date: '2025-01-27',
		teams: [
			{ teamId: 1, name: 'Red Vipers', players: ['RV1', 'RV2', 'RV3'], points: 0 },
			{ teamId: 2, name: 'Iron Fury', players: ['IF1', 'IF2', 'IF3'], points: 0 },
			{ teamId: 3, name: 'Omega Crew', players: ['OC1', 'OC2', 'OC3'], points: 0 }
		],
		matches: [{ matchId: 1, teamA: 1, teamB: 3, scoreA: null, scoreB: null, winner: null }]
	},

	{
		tournamentId: 8,
		name: 'Legends Arena Tournament',
		game: 'Valorant',
		date: '2025-03-21',
		teams: [
			{ teamId: 1, name: 'Prime Agents', players: ['PA1', 'PA2', 'PA3'], points: 0 },
			{ teamId: 2, name: 'Shadow Rush', players: ['SR1', 'SR2', 'SR3'], points: 0 }
		],
		matches: [{ matchId: 1, teamA: 1, teamB: 2, scoreA: null, scoreB: null, winner: null }]
	}
];
