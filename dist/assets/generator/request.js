/* global compiler */

class rscript {
    constructor() {
        this.compiler = new compiler();
    }
    execute(raw) {
        let m_internal = this.compiler.parse(raw);
        let m_postExec = this.compiler.compile(m_internal);
        return (m_postExec);
    }
}
