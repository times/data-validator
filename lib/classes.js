class OK {
  constructor() {
    this.valid = true;
    this.errors = [];
  }
}
module.exports.OK = OK;

class Err {
  constructor(errors) {
    this.valid = false;
    this.errors = errors;
  }
}
module.exports.Err = Err;

module.exports.ok = () => new OK();
module.exports.err = errs => new Err(errs);

module.exports.isOK = r => r instanceof OK;
module.exports.isErr = r => r instanceof Err;
