const BACKEND_TOPICS = [
  // Bootup
  {
    alias: "/boot",
    pub: "/themaze/booted",
    sub: "/themaze/booted/${clientId}",
  },
  // Player login
  {
    alias: "/player/login",
    pub: "/themaze/${clientId}/gui/player/login",
    sub: "/themaze/${clientId}/gui/player/login/response",
  },
  // Player register
  {
    alias: "/player/register",
    pub: "/themaze/${clientId}/gui/player/registration",
    sub: "/themaze/${clientId}/gui/player/registration/response",
  },
  // Wristband scan
  {
    alias: "/wristband/scan",
    pub: null,
    sub: "/themaze/${clientId}/gui/player/wristbandScan",
  },
  // Wristband register
  {
    alias: "/wristband/register",
    pub: "/themaze/${clientId}/gui/player/registerWristband",
    sub: "/themaze/${clientId}/gui/player/registerWristband/response",
  },
  // Wristband validate
  {
    alias: "/wristband/isValid",
    pub: "/themaze/${clientId}/gui/player/isValid",
    sub: "/themaze/${clientId}/gui/player/isValid/response",
  },
  // Wristband info
  {
    alias: "/wristband/info",
    pub: "/themaze/${clientId}/wristband/info",
    sub: "/themaze/${clientId}/wristband/info/response",
  },
  // Teams list
  {
    alias: "/teams/list",
    pub: "/themaze/${clientId}/gui/teams/all",
    sub: "/themaze/${clientId}/gui/teams/all/response",
  },
  // Create group team
  {
    alias: "/groupteam/merge",
    pub: "/themaze/${clientId}/gui/groupteam/merge",
    sub: "/themaze/${clientId}/gui/groupteam/merge/response",
  },
  // Create normal team
  {
    alias: "/team/merge",
    pub: "/themaze/${clientId}/gui/team/merge",
    sub: "/themaze/${clientId}/gui/team/merge/response",
  },
  // Packages list
  {
    alias: "/packages/list",
    pub: "/themaze/${clientId}/gui/packages/all",
    sub: "/themaze/${clientId}/gui/packages/all/response",
  },
  // Add package to team
  {
    alias: "/team/package/add",
    pub: "/themaze/${clientId}/gui/team/package/add",
    sub: "/themaze/${clientId}/gui/team/package/add/response",
  },
  // Remove package from team
  {
    alias: "/team/package/delete",
    pub: "/themaze/${clientId}/gui/team/package/delete",
    sub: "/themaze/${clientId}/gui/team/package/delete/response",
  },
  // Active package
  {
    alias: "/team/activate",
    pub: "/themaze/${clientId}/gui/team/activate",
    sub: "/themaze/${clientId}/gui/team/activate/response",
  },
];

export { BACKEND_TOPICS };
