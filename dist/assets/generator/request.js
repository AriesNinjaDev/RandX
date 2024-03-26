/* global compiler */

class rscript {
    constructor() {
        this.compiler = new compiler();
    }
    execute(raw) {
        let m_result = [];
        let m_internal = this.compiler.parse(raw);
        if (m_internal.error) {
            return m_internal;
        }
        for (let i=0; i<m_internal.amount; i++) {
            const m_compiledStep = this.compiler.compile(m_internal);
            if (m_compiledStep.error) {
                return m_compiledStep;
            }
            m_result.push(m_compiledStep);
        }
        return {data:m_result,type:m_internal.type};
    }
}
