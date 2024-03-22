/* global compiler */

class rscript {
    constructor() {
        this.compiler = new compiler();
    }
    compile(raw) {
        let res = this.compiler.compile(raw);
        return res;
    }
}
