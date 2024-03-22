// Primary rscript compiler

class compiler {
    checkVariable(variable, index) {
        if (variable.includes(" ")) {
            return {
                error: "Invalid variable name: Variables may not include spaces.",
                line: index,
            };
        } else if (variable[0].match(/[0-9]/)) {
            return {
                error: "Invalid variable name: Variables may not start with a number.",
                line: index,
            };
        } else if (variable[0] === "_") {
            return {
                error: "Invalid variable name: User-defined variables may not start with an underscore.",
                line: index,
            };
        } else if (variable.match(/[^A-Za-z0-9_]/)) {
            return {
                error: "Invalid variable name: Variables may only contain A-Z, a-z, 0-9, and _",
                line: index,
            };
        } else {
            return true;
        }
    }

    ciSplit(string, delimiter) {
        return string.split(new RegExp(delimiter, "i"));
    }

    compile(raw) {
        let amount = 1;
        let seed = Math.floor(
            Date.now() * Math.random() * (Math.random() + Math.random())
        );

        let existingVars = [];
        let existingLists = [];

        let instructions = [];
        let traversingList = false;
        let resultEntryExpected = false;

        let index = 1;

        // Split the raw code into lines
        let lines = raw.split("\n");

        // Remove comments
        lines = lines.map((line) => line.split("//")[0]);

        // Remove empty lines
        // lines = lines.filter((line) => line.trim() !== "");

        // Look through each line for variable instantiations, list instantiations, and the "result:" tag and add them to instructions.
        for (const line of lines) {
            if (line[0] === " ") {
                return { error: "Invalid indentation.", line: index };
            } else if (line[0] === "-") {
                if (!traversingList) {
                    return {
                        error: "Invalid item declaration: Items must belong to a list.",
                        line: index,
                    };
                }
                // TODO
            } else if (line[0] == '_') {
                switch (line.split(":")[0].trim()) {
                    case "_amount":
                        amount = parseInt(line.split(":")[1].trim());
                        break;
                    case "_seed":
                        seed = parseInt(line.split(":")[1].trim());
                        break;
                    case "_alg":
                        return {
                            error: "Temporary error: Algorithm selection is not yet supported.",
                            line: index,
                        };
                    case "_export":
                        return {
                            error: "Temporary error: Export types are not yet supported.",
                            line: index,
                        };
                    default:
                        return {
                            error: "Invalid Declaration: You cannot define a reserved variable.",
                            line: index,
                        };
                }
            } else if (line.toLowerCase().includes("list ")) {
                if (resultEntryExpected) {
                    return {
                        error: 'Invalid list declaration: You cannot declare a list after the "result:" tag.',
                        line: index,
                    };
                } else if (traversingList) {
                    return {
                        error: "Invalid list declaration: You cannot declare a list within another list.",
                        line: index,
                    };
                }
                if (
                    this.ciSplit(line, "list ").length != 2 ||
                    this.ciSplit(line, "list ")[0] != ""
                ) {
                    console.log(this.ciSplit(line, "list "));
                    return { error: "Invalid Declaration    : The list keyword must be the first word on the line.", line: index };
                }
                let list = this.ciSplit(line, "list ")[1].split(":")[0].trim();
                if (existingVars.includes(list)) {
                    return {
                        error: 'Invalid Declaration: Variable "' + list + '" already exists.',
                        line: index,
                    };
                }
                if (list in existingLists.includes(list)) {
                    return {
                        error: 'Invalid Declaration: List "' + list + '" already exists.',
                        line: index,
                    };
                }
                if (
                    !this.ciSplit(line, "list ")[1] &&
                    this.ciSplit(line, "list ")[1].split(":")[1].trim() != ""
                ) {
                    return {
                        error: 'Invalid Declaration: There must not be characters succeeding a ":" assigner.',
                        line: index,
                    };
                }
                const validState = this.checkVariable(list, index);
                if (validState !== true) {
                    return validState;
                }
                traversingList = true;
                existingLists.push(list);
                instructions.push({ type: "list", name: list, value: [] });
            } else if (line.includes("result:")) {
                if (traversingList) {
                    return {
                        error: "Invalid Result Declaration: You cannot declare a result within a list.",
                        line: index,
                    };
                } else if (resultEntryExpected) {
                    return {
                        error: 'Invalid Result Declaration: You cannot re-declare a result after the "result:" tag.',
                        line: index,
                    };
                }
                if (
                    !this.ciSplit(line, "result ")[1] &&
                    this.ciSplit(line, "result ")[1].split(":")[1].trim() != ""
                ) {
                    return {
                        error: 'Invalid Result Declaration: There must not be characters succeeding a ":" assigner.',
                        line: index,
                    };
                }
                resultEntryExpected = true;
                instructions.push({ type: "result", value: "" });
            } else if (line.includes(":")) {
                if (traversingList) {
                    return {
                        error: "Invalid Declaration: You cannot declare a variable within a list.",
                        line: index,
                    };
                } else if (resultEntryExpected) {
                    return {
                        error: 'Invalid Declaration: You cannot declare a variable after the "result:" tag.',
                        line: index,
                    };
                }
                if (line.split(":")[0].trim().toLowerCase() == "list") {
                    return {
                        error: 'Invalid Declaration: You cannot create a variable called "list".',
                        line: index,
                    };
                }
                let variable = line.split(":")[0].trim();
                let value = line.split(":")[1].trim();
                if (value === "") {
                    return {
                        error: "Invalid Declaration: Variables must have a value.",
                        line: index,
                    };
                }
                console.log(existingVars);
                if (existingVars.includes(variable)) {
                    return {
                        error: 'Invalid Declaration: Variable "' + variable + '" already exists.',
                        line: index,
                    };
                }
                if (existingLists.includes(variable)) {
                    return {
                        error: 'Invalid Declaration: List "' + variable + '" already exists.',
                        line: index,
                    };
                }
                const validState = this.checkVariable(variable, index);
                if (validState !== true) {
                    return validState;
                }
                existingVars.push(variable);
                instructions.push({
                    type: "variable",
                    name: variable,
                    value: value,
                });
            } else if (line.trim() === "") {
                // Do nothing
            } else {
                return {
                    error: "Stray text: Text on this line can't be attached to a declaration or statement.",
                    line: index,
                };
            }
            index++;
        }
    }
}
