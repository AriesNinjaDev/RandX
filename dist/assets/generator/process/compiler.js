
// Primary rscript compiler

class compiler {

    checkVariable(variable, index) {
        if (variable.includes(' ')) {
            return { error: 'Invalid variable name: Variables may not include spaces.', line: index };
        } else if (variable[0].match(/[0-9]/)) {
            return { error: 'Invalid variable name: Variables may not start with a number.', line: index };
        } else if (variable[0] === "_") {
            return { error: 'Invalid variable name: User-defined variables may not start with an underscore.', line: index };
        } else if (variable.match(/[^A-Za-z0-9_]/)) {
            return { error: 'Invalid variable name: Variables may only contain A-Z, a-z, 0-9, and _', line: index };
        } else {
            return true;
        }
    }


    compile(raw) {

        let amount = 1;
        let seed = Math.floor(Date.now() * Math.random() * (Math.random() + Math.random()));

        let instructions = {};
        let traversingList = false;
        let resultValue = false;

        // Split the raw code into lines
        let lines = raw.split('\n');

        // Remove empty lines
        lines = lines.filter(line => line.trim() !== '');

        // Remove comments
        lines = lines.map(line => line.split('//')[0]);

        // Look through each line for variable instantiations, list instantiations, and the "result:" tag and add them to instructions.
        lines.forEach((line, index) => {
            if (line[0] === ' ') {
                return { error: 'Invalid indentation.', line: index };
            } else if (line[0] === '-') {
                if (!traversingList) {
                    return { error: 'Invalid item declaration: Items must belong to a list.', line: index };
                }
            } else if (line.includes('list ')) {
                if (line.split('list ')[1].length != 2 || line.split('list')[0].trim() != '') {
                    return { error: 'Invalid list declaration', line: index };
                }
                let list = line.split('list ')[1].split(':')[0].trim();
                if (line.split('list ')[1].split(':')[1].trim() !== undefined) {
                    return { error: 'Invalid list declaration: There may not be characters succeeding a ":" assigner.', line: index };
                }
                const validState = this.checkVariable(list, index);
                if (validState !== true) {
                    return validState;
                }
                instructions.push({ type: 'list', name: list, value: [] });
            } else if (line.includes('result:')) {
                instructions['result'] = line.split('result:')[1].trim();
            } else if (line.includes('var ')) {
                let variable = line.split('var ')[1].split(' = ')[0];
                let value = line.split('var ')[1].split(' = ')[1];
                instructions[variable] = value;
            } else {
                return { error: 'Stray text: Text on this line can\'t be attached to a declaration or statement.', line: index };
            }
        });




    };

}
