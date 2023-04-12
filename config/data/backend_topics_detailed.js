const BACKEND_TOPICS = [
  // -------------------------- Player register ------------------------------ //
  {
    alias: "/player/register",
    pub: {
      topic: "/themaze/${clientId}/gui/player/registration",
      payloads: [
        {
          username: "something",
          name: "yolo",
          surname: "yolo3",
          email: "email@gmail.com",
          password: "yolololo",
        },
        {
          timestamp: 1679577924736,
          result: "OK",
          player: {
            name: null,
            surname: null,
            username: "yolo4",
            email: "yolo4@yolo4.com",
          },
        },
      ],
    },
    sub: {
      topic: "/themaze/${clientId}/gui/player/registration/response",
      payloads: [
        {
          timestamp: 1679566508599,
          result: "NOK",
          message: "This username already exists",
        },
        {
          timestamp: 1679566496366,
          result: "NOK",
          validationErrors: {
            email: "invalid",
          },
        },
        {
          timestamp: 1679566800441,
          result: "NOK",
          validationErrors: {
            surname: "empty",
            name: "empty",
            email: "empty",
          },
        },
        {
          timestamp: 1679566847776,
          result: "NOK",
          message:
            'Unrecognized field "confirmPassword" (class gr.agentfactory.services.player.messages.PlayerRegistrationMessage), not marked as ignorable (6 known properties: "timestamp", "name", "email", "username", "surname", "password"])\n at [Source: (byte[])"{"username":"yolo3","surname":"","name":"","email":"","password":"","confirmPassword":"...."}"; line: 1, column: 88] (through reference chain: gr.agentfactory.services.player.messages.PlayerRegistrationMessage["confirmPassword"])',
        },
      ],
    },
  },

  // ------------------------------ Player login ------------------------------ //
  {
    alias: "/player/login",
    pub: {
      topic: "/themaze/${clientId}/gui/player/login",
      payloads: [
        {
          username: "yolo4",
          password: "yolo4",
        },
      ],
    },
    sub: {
      topic: "/themaze/${clientId}/gui/player/login/response",
      payloads: [
        {
          timestamp: 1679578726601,
          result: "OK",
          player: {
            name: null,
            surname: null,
            username: "yolo4",
            email: "yolo4@yolo4.com",
          },
        },
        {
          timestamp: 1679578668527,
          result: "NOK",
          message: "Wrong username and/or password",
        },
        {
          timestamp: 1679578603820,
          result: "NOK",
          validationErrors: {
            password: "empty",
          },
        },
        {
          timestamp: 1679578443864,
          result: "NOK",
          message:
            'Unrecognized field "surname" (class gr.agentfactory.services.player.messages.PlayerLoginMessage), not marked as ignorable (3 known properties: "password", "timestamp", "username"])\n at [Source: (byte[])"{"username":"yolo4","surname":"yolo4","name":"yolo4","email":"yolo4@yolo4.com","password":"yolo4"}"; line: 1, column: 32] (through reference chain: gr.agentfactory.services.player.messages.PlayerLoginMessage["surname"])',
        },
      ],
    },
  },

  // ------------------------------ Player Search ------------------------------ //
  {
    alias: "/player/search",
    pub: {
      topic: "themaze/${clientId}/gui/player/search",
      payloads: [
        {
          timestamp: 1234234324,
          searchTerm: "TG1",
        },
        {
          timestamp: 1232456789,
          searchTerm: "@maze.com",
        },
        {
          timestamp: 123456789,
          searchTerm: "",
        },
        {
          timestamp: 12345689,
          searchTerm: "$$$$$$$$$$$$$$",
        },
      ],
    },
    sub: {
      topic: "/themaze/${clientId}/gui/player/search/response",
      payloads: [
        {
          timestamp: 1681298866176,
          result: "OK",
          players: [
            {
              username: "TG1",
              name: null,
              surname: null,
              email: "TG1@maze.com",
              wristbandMerged: false,
              wristband: null,
            },
            {
              username: "TG10",
              name: null,
              surname: null,
              email: "TG10@maze.com",
              wristbandMerged: false,
              wristband: null,
            },
          ],
        },
        {
          timestamp: 1681298981576,
          result: "OK",
          players: [
            {
              username: "TG1",
              name: null,
              surname: null,
              email: "TG1@maze.com",
              wristbandMerged: false,
              wristband: null,
            },
            {
              username: "TG2",
              name: null,
              surname: null,
              email: "TG2@maze.com",
              wristbandMerged: false,
              wristband: null,
            },
          ],
        },
        {
          timestamp: 1681299099212,
          result: "NOK",
          message: "empty search term",
        },
        {
          timestamp: 1681299125922,
          result: "OK",
          players: [],
        },
      ],
    },
  },

  // wristband scan
  {
    pub: null,
    sub: {
      payloads: [
        {
          timestamp: 1679582297148,
          result: "OK",
          wristbandNumber: 32,
          wristbandColor: 3,
        },
      ],
    },
  },
];
