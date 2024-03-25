/* global compiler */

class rscript {
    constructor() {
        this.compiler = new compiler();
    }
    execute(raw) {
        let m_result = [];
        let m_internal = this.compiler.parse(raw);
        for (let i=0; i<m_internal.amount; i++) {
            m_result.push(this.compiler.compile(m_internal));
        }
        return m_result;
    }
}
