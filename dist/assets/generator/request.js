/* global compiler */

class rscript {
    constructor() {
        this.compiler = new compiler();
    }
    compile(raw) {
        this.compiler.compile(raw);
    }
}