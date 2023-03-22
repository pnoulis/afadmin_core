const TEAM_STATES = [
  "PENDING_PACKAGES",
  "LOADED_PACKAGES",
  "PACKAGE_RUNNING",
  "PACKAGE_PAUSED",
  "FINISHED",
];

const BACKEND_MOCK_STATE = {
  teams: [
    {
      name: "team_#1",
      totalPoints: 0,
      teamState: TEAM_STATES[1],
      currentRoster: {
        version: 1,
        players: [
          {
            username: "t1_player#1",
            wristbandNumber: 1,
            wristbandColor: 0,
          },
          {
            username: "t1_player#2",
            wristbandNumber: 2,
            wristbandColor: 1,
          },
        ],
      },
      packages: [
        {
          id: 1,
          name: "Per Mission 15",
          cost: 150.0,
          started: null,
          ended: null,
          missions: 15,
          missionsPlayed: 0,
          active: false,
        },
        {
          id: 2,
          name: "Per Time 60",
          cost: 100.0,
          started: null,
          ended: null,
          duration: 5400.0,
          paused: false,
          active: false,
        },
      ],
    },
    {
      name: "team_#2",
      totalPoints: 120,
      teamState: TEAM_STATES[2],
      currentRoster: {
        version: 1,
        players: [
          {
            username: "t2_player#1",
            wristbandNumber: 3,
            wristbandColor: 2,
          },
          {
            username: "t2_player#2",
            wristbandNumber: 4,
            wristbandColor: 3,
          },
        ],
      },
      packages: [
        {
          id: 3,
          name: "Per Mission 20",
          cost: 200.0,
          started: 1234235234,
          ended: null,
          missions: 20,
          missionsPlayed: 3,
          active: true,
        },
        {
          id: 4,
          name: "Per Time 90",
          cost: 150.0,
          started: null,
          ended: null,
          duration: 5400.0,
          paused: false,
          active: false,
        },
      ],
    },
    {
      name: "team_#3",
      totalPoints: 100,
      teamState: TEAM_STATES[3],
      currentRoster: {
        version: 1,
        players: [
          {
            username: "t3_player#1",
            wristbandNumber: 5,
            wristbandColor: 4,
          },
          {
            username: "t3_player#2",
            wristbandNumber: 6,
            wristbandColor: 5,
          },
        ],
      },
      packages: [
        {
          id: 5,
          name: "Per Mission 10",
          cost: 100.0,
          started: 1234234234,
          ended: 1234324423,
          missions: 10,
          missionsPlayed: 10,
          active: false,
        },
        {
          id: 6,
          name: "Per Time 120",
          cost: 200.0,
          started: 123434234,
          ended: null,
          duration: 6000.0,
          paused: true,
          active: true,
        },
      ],
    },
    {
      name: "team_#4",
      totalPoints: 200,
      teamState: TEAM_STATES[4],
      currentRoster: {
        version: 1,
        players: [
          {
            username: "t4_player#1",
            wristbandNumber: 7,
            wristbandColor: 6,
          },
          {
            username: "t4_player#2",
            wristbandNumber: 8,
            wristbandColor: 0,
          },
        ],
      },
      packages: [
        {
          id: 7,
          name: "Per Mission 10",
          cost: 100.0,
          started: 1234234234,
          ended: 1234324423,
          missions: 10,
          missionsPlayed: 10,
          active: false,
        },
        {
          id: 8,
          name: "Per Time 120",
          cost: 200.0,
          started: 123434234,
          ended: 1888987987,
          duration: 6000.0,
          paused: false,
          active: false,
        },
      ],
    },
    {
      name: "team_#5",
      totalPoints: 0,
      teamState: TEAM_STATES[0],
      currentRoster: {
        version: 1,
        players: [
          {
            username: "t5_player#1",
            wristbandNumber: 9,
            wristbandColor: 1,
          },
          {
            username: "t5_player#2",
            wristbandNumber: 10,
            wristbandColor: 2,
          },
        ],
      },
      packages: [],
    },
  ],
};

export { BACKEND_MOCK_STATE };
