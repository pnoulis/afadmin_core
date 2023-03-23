const validatePlayer = {
  registration(player, cb) {
    if (false) {
      return cb({ username: "some error" });
    }
    return player;
  },

  login(player, cb) {
    if (false) {
      return cb({ username: "some error" });
    }
    return player;
  },
};

export { validatePlayer };
