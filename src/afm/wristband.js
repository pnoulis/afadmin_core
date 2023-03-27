class Wristband {
  constructor(wristband = {}) {
    const conf = Wristband.parseConf(wristband);
    this.id = conf.id;
    this.colorCode = conf.colorCode;
    this.state = null;
    this.states = {
      unassigned: new Unassigned(this),
      pairing: new Pairing(this),
      paired: new Paired(this),
      registered: new Registered(this),
      verified: new Verified(this),
      assigned: new Assigned(this),
    };
    this.setState(conf.state);
  }

  static parseConf(userConf) {
    const conf = {};
    conf.id = userConf.id || Math.random().toString(16).slice(2, 8);
    conf.colorCode = userConf.colorCode || null;
  }
}

Wristband.prototype.setState = function setState(state, cb) {
  if (typeof state === "string") {
    this.state = this.states[state];
  } else {
    this.state = state;
  }
  cb && cb(this.state);
};

class State {
  constructor(wristband) {
    this.wristband = wristband;
  }

  getState() {
    return this;
  }
}

class Unassigned extends State {
  constructor(wristband) {
    super(wristband);
  }
  static get name() {
    return Unassigned.name.toLowerCase();
  }
}

class Pairing extends State {
  constructor(wristband) {
    super(wristband);
  }
  static get name() {
    return Pairing.name.toLowerCase();
  }
}

class Paired extends State {
  constructor(wristband) {
    super(wristband);
  }
  static get name() {
    return Paired.name.toLowerCase();
  }
}

class Registered extends State {
  constructor(wristband) {
    super(wristband);
  }
  static get name() {
    return Registered.name.toLowerCase();
  }
}

class Verified extends State {
  constructor(wristband) {
    super(wristband);
  }
  static get name() {
    return Verified.name.toLowerCase();
  }
}

class Assigned extends State {
  constructor(wristband) {
    super(wristband);
  }

  static get name() {
    return Assigned.name.toLowerCase();
  }
}

export { Wristband };
