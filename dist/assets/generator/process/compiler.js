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

    tokenize(input,line) {
        let counter = 0;
        const identifiers = [];
        const convertedString = input.replace(/\\\[|\\\]|(\[.*?\])/g, (match, group) => {
            if (group) {
                identifiers.push(group.substring(1, group.length - 1)); // Remove square brackets
                return '%' + (counter++);
            }
            return match; // Return escaped brackets unchanged
        });

        return {
            text: convertedString,
            ids: identifiers,
            line: line
        };
    }

    parse(raw) {
        let amount = 1;
        let seed = Math.floor(
            Date.now() * Math.random() * (Math.random() + Math.random())
        );
        let exportType = "text";

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

            if (line[0] === " " && line.trim() !== '') {
                return { error: "Invalid Indentation: Line cannot begin with spaces or tabs.", line: index };
            } else if (line[0] === "-") {
                if (!traversingList) {
                    return {
                        error: "Invalid Item Declaration: Items must belong to a list.",
                        line: index,
                    };
                }
                if (instructions[instructions.length - 1].type !== 'list') {
                    return {
                        error: "Internal Compiler Error: The pipeline's latest queue was not a list type.",
                        line: index,
                    }
                }
                if (!line.split("-")[1]) {
                    return {
                        error: "Invalid Item Declaration: Items cannot be empty.",
                        line: index,
                    }
                }
                instructions[instructions.length - 1].value.push(line.split("-")[1].trim());
            } else if (line[0] == '_') {
                if (traversingList) {
                    traversingList = false;
                }
                if (resultEntryExpected) {
                    return {
                        error: 'Invalid Declaration: You cannot declare a variable after the result tag.',
                        line: index,
                    };
                }
                if (line.split(":").length != 2) {
                    return {
                        error: "Invalid Declaration: Declarations must have a single colon.",
                        line: index,
                    };
                }
                switch (line.split(":")[0].trim()) {
                    case "_amount":
                        if (Number.isNaN(parseInt(line.split(":")[1].trim()))) {
                            return {
                                error: "Invalid Amount: The amount must be a number.",
                                line: index,
                            };
                        }
                        amount = parseInt(line.split(":")[1].trim());
                        break;
                    case "_seed":
                        seed = parseInt(line.split(":")[1].trim());
                        break;
                    case "_alg":
                        return {
                            error: "Temporary Error: Algorithm selection is not yet supported.",
                            line: index,
                        };
                    case "_export":
                        let type = line.split(":")[1].trim();
                        if (type !== "text" && type !== "json" && type !== "list") {
                            return {
                                error: "Invalid Export Type: The export type must be either text or json.",
                                line: index,
                            };
                        }
                        exportType = type;
                        break;
                    default:
                        return {
                            error: "Invalid Declaration: You cannot define a reserved variable.",
                            line: index,
                        };
                }
            } else if (line.toLowerCase().includes("list ")) {
                if (resultEntryExpected) {
                    return {
                        error: 'Invalid List Declaration: You cannot declare a list after the result tag.',
                        line: index,
                    };
                } else if (traversingList) {
                    traversingList = false;
                }
                if (
                    this.ciSplit(line, "list ").length != 2 ||
                    this.ciSplit(line, "list ")[0] != "" // we dont trim here to prevent white spaces before the keyword
                ) {
                    return { error: "Invalid List Declaration: The list keyword must be the first word on the line.", line: index };
                }
                let list = this.ciSplit(line, "list ")[1].split(":")[0].trim();
                if (existingVars.includes(list)) {
                    return {
                        error: 'Invalid List Declaration: Variable "' + list + '" already exists.',
                        line: index,
                    };
                }
                if (existingLists.includes(list)) {
                    return {
                        error: 'Invalid List Declaration: List "' + list + '" already exists.',
                        line: index,
                    };
                }
                if (
                    !this.ciSplit(line, "list ")[1] &&
                    this.ciSplit(line, "list ")[1].split(":")[1].trim() != ""
                ) {
                    return {
                        error: 'Invalid List Declaration: There must not be characters succeeding a ":" assigner.',
                        line: index,
                    };
                }
                const validState = this.checkVariable(list, index);
                if (validState !== true) {
                    return validState;
                }
                traversingList = true;
                existingLists.push(list);
                instructions.push({ type: "list", name: list, value: [], line: index });
            } else if (line.includes("result") && line.includes(":")) {
                if (traversingList) {
                    traversingList = false;
                } else if (resultEntryExpected) {
                    return {
                        error: 'Invalid Result Declaration: You cannot re-declare a result after the result tag.',
                        line: index,
                    };
                }
                if (
                    this.ciSplit(line, "result").length != 2 ||
                    this.ciSplit(line, "result")[0] != "" // we dont trim here to prevent white spaces before the keyword
                ) {
                    return { error: "Invalid Result Declaration: The result keyword must be the first word on the line.", line: index };
                }
                if (
                    this.ciSplit(line, "result")[1].split(":")[1].trim() != ""
                ) {
                    return {
                        error: 'Invalid Result Declaration: There must not be characters succeeding a ":" assigner.',
                        line: index,
                    };
                }
                resultEntryExpected = true;
                instructions.push({ type: "result", value: "", line: index + 1 });
            } else if (/(?<!\\):/g.test(line) && ! line.split(":")[0].includes("[")) {
                console.log(line)
                if (traversingList) {
                    traversingList = false;
                } else if (resultEntryExpected) {
                    return {
                        error: 'Invalid Variable Declaration: You cannot declare a variable after the result tag.',
                        line: index,
                    };
                }
                let variable = line.split(":")[0].trim();
                let value = line.split(":")[1].trim();
                if (variable.toLowerCase() == "list") {
                    return {
                        error: 'Invalid Variable Declaration: You cannot create a variable called "list".',
                        line: index,
                    };
                }
                if (value === "") {
                    return {
                        error: "Invalid Variable Declaration: Variables must have a value.",
                        line: index,
                    };
                }
                if (existingVars.includes(variable)) {
                    return {
                        error: 'Invalid Variable Declaration: Variable "' + variable + '" already exists.',
                        line: index,
                    };
                }
                if (existingLists.includes(variable)) {
                    return {
                        error: 'Invalid Variable Declaration: List "' + variable + '" already exists.',
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
                    line: index
                });
            } else if (line.trim() === "") {
                // Do nothing
            } else {
                if (resultEntryExpected) {
                    if (instructions[instructions.length - 1].type !== 'result') {
                        return {
                            error: "Internal Compiler Error: The pipeline's latest queue was not a result type.",
                            line: index,
                        }
                    }
                    instructions[instructions.length - 1].value = line.trim();
                    return { instructions, amount, type:exportType };
                }
                return {
                    error: "Stray Text: Text on this line can't be attached to a declaration or statement.",
                    line: index,
                };
            }
            index++;
        }
        if (!instructions.length) {
            return {
                error: "No Instructions: The script must contain at least one instruction.",
                line: index - 1,
            };
        }
        if (instructions[instructions.length - 1].type === 'result') {
            return {
                error: "Invalid Result Declaration: Results must have a value.",
                line: index,
            };
        }
    }

    getRandomAny() {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        return characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    // This function is used to compute the result of a dynamic variable. It is recursive and will continue to call itself until all dynamic variables are resolved. It will return the final result of the dynamic variable.
    computeDynamic(accessors, template) {
        if (template.ids.length === 0) {
            return template.text;
        }
        let computedIds = [];
        for (const identifier of template.ids) {
            if (this.checkVariable(identifier) === true) {
                computedIds.push(this.computeDynamic(accessors, accessors[identifier]));
            } else {
                const allowedDynamicChars = ['#', '&', '^', '@', '*'];
                if (allowedDynamicChars.some(char => { return identifier.includes(char) })) {
                    // Certain dynamic characters are allowed which use special behaviors. # is a random number, & is a random lowercase letter, ^ is a random uppercase letter, @ is a random upper/lowercase letter, * is a random upper/lowercase letter or number.
                    let randomString = '';
                    for (let i of identifier) {
                        if (i === '#') {
                            randomString += Math.floor(Math.random() * 10);
                        } else if (i === '&') {
                            randomString += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
                        } else if (i === '^') {
                            randomString += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
                        } else if (i === '@') {
                            randomString += String.fromCharCode(Math.floor(Math.random() * 52) + 65);
                        } else if (i === '*') {
                            randomString += this.getRandomAny();
                        } else {
                            return {
                                error: "Invalid Dynamic Identifier: Dynamic identifiers must be valid variables, special dynamic characters, or random number ranges.",
                                line: template.line,
                            }
                        }
                    }
                    computedIds.push(randomString);
                } else if (identifier.includes('-')) {
                    let lowerBound = parseInt(identifier.split('-')[0]);
                    let upperBound = parseInt(identifier.split('-')[1]);
                    // If there is no upper bound, then the upper bound is the highest number with the same amount of digits as the lower bound.
                    if (isNaN(upperBound)) {
                        upperBound = Math.pow(10, lowerBound.toString().length) - 1;
                    }
                    // If there is no lower bound, then the lower bound is 0.
                    if (isNaN(lowerBound)) {
                        lowerBound = 0;
                    }
                    computedIds.push(Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound);
                } else if (identifier.includes(':')) {
                    // [PLURAL:myVar] // correctly pluralizes myVar if it is a word, or is an "s" if it is a number other than 1.
                    // [UNIT:myVar] // correctly adds a or an to myVar if it is a word. 
                    // [UPPER:myVar] // returns the uppercase of myVar
                    // [LOWER:myVar] // returns the lowercase of myVar
                    // [CAPS:myVar] // returns the capitalized myVar
                    // [2:myVar] // returns characters after the 2nd character of myVar
                    // [1:myVar:3] // returns the 1st to 3rd characters of myVar (inclusive)
                    let tag = identifier.split(':')[0];
                    let varName = identifier.split(':')[1];
                    if (!accessors[varName]) {
                        return {
                            error: "Invalid Dynamic Identifier: Dynamic identifiers must be valid variables, special dynamic characters, or random number ranges.",
                            line: template.line,
                        }
                    }
                    const reference = this.computeDynamic(accessors, accessors[varName]);
                    let result = '';
                    if (tag === 'PLURAL') {
                        if (reference.endsWith('s')) {
                            result = reference + 'es';
                        } else if (reference.endsWith('y')) {
                            result = reference.slice(0, -1) + 'ies';
                        } else if (parseInt(reference) === 1) {
                            result = "";
                        } else if (Number(reference)) {
                            result = "s";
                        } else {
                            result = reference + 's';
                        }
                    } else if (tag === 'UNIT') {
                        if ('aeiou'.includes(reference.charAt(0).toLowerCase())) {
                            result = 'an';
                        } else {
                            result = 'a';
                        }
                    } else if (tag === 'UPPER') {
                        result = reference.toUpperCase();
                    } else if (tag === 'LOWER') {
                        result = reference.toLowerCase();
                    } else if (tag === 'CAPS') {
                        // Needs to support multiple words.
                        if (reference.includes(' ')) {
                            result = reference.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                        } else {
                            result = reference.charAt(0).toUpperCase() + reference.slice(1);
                        }
                    } else if (tag.match(/^[0-9]+$/)) {
                        result = reference.slice(parseInt(tag));
                        if (identifier.split(':').length === 3) {
                            console.log(identifier)
                            result = reference.slice(parseInt(tag), parseInt(identifier.split(':')[2]));
                        }
                    } else {
                        return {
                            error: "Invalid Dynamic Identifier: Dynamic identifiers must be valid variables, special dynamic characters, or random number ranges.",
                            line: template.line,
                        }
                    }
                    computedIds.push(result);
                } else {
                    return {
                        error: "Invalid Dynamic Identifier: Dynamic identifiers must be valid variables, special dynamic characters, or random number ranges.",
                        line: template.line,
                    }
                }
            }
        }
        for (const id of computedIds) {
            template.text = template.text.replace('%' + computedIds.indexOf(id), id);
        }
        return template.text;
    }

    unify(str) {
        return str.replace(/\\(.)/g, '$1');
    }

    parseList(list,line) {
        // Filter out strings containing percentages and separate them
        const percentageStrings = [];
        const normalStrings = [];
        let iterLine = line;
        list.forEach((element) => {
            iterLine++;
            if (element.trim().endsWith('%')) {
                if (element.charAt(element.length - 2) === '\\') {
                    normalStrings.push(element.trim());
                }
                    const pKeyword = element.trim().substring(element.trim().lastIndexOf(" ")+1);
                if (! Number(pKeyword.replace('%',''))) {
                    return {
                        error: "Invalid Percentage: Percentages must be numbers.",
                        line: iterLine,
                    }
                } else if (! (Number(pKeyword.replace('%','')) < 100)) {
                    return {
                        error: "Invalid Percentage: Percentages must be less than 100.",
                        line: iterLine,
                    }
                } else if (! (Number(pKeyword.replace('%','')) > 0)) {
                    return {
                        error: "Invalid Percentage: Percentages must be greater than 0.",
                        line: iterLine,
                    }
                }
                percentageStrings.push({
                    value: element.substring(0,element.lastIndexOf(" ")).trim(),
                    percentage: parseFloat(pKeyword.replace('%', ''))
                });
            } else {
                normalStrings.push(element.trim());
            }
        });
    
        // Calculate total percentage of normal strings
        const totalNormalPercentage = normalStrings.length * 100 / list.length;
        // Adjust the percentage for strings with percentages
        const adjustedTotalPercentage = totalNormalPercentage + percentageStrings.reduce((acc, curr) => acc + curr.percentage, 0);
    
        // Generate a random number between 0 and adjustedTotalPercentage
        const randomNumber = Math.random() * adjustedTotalPercentage;
    
        // Check if the random number falls within the percentage range of percentage strings
        if (randomNumber < totalNormalPercentage) {
            // Choose randomly from normal strings
            return normalStrings[Math.floor(randomNumber / (totalNormalPercentage / normalStrings.length))];
        } else {
            // Subtract totalNormalPercentage from randomNumber to adjust for percentage strings
            let adjustedRandomNumber = randomNumber - totalNormalPercentage;
            // Choose randomly from percentage strings
            for (const percentageString of percentageStrings) {
                if (adjustedRandomNumber < percentageString.percentage) {
                    return percentageString.value;
                }
                adjustedRandomNumber -= percentageString.percentage;
            }
        }
    }

    compile(data) {

        if (!data) {
            return undefined;
        } else if (data.error) {
            return data;
        }

        const instructions = data.instructions

        let storage = new Map([]);

        let accessors = {};

        let result;

        for (const step of instructions) {

            var tagCount;

            if (step.type === 'variable' || step.type === 'result') {
                const brOpenCount = (step.value.split("[").length - 1) - (step.value.split("\\[").length - 1);
                const brCloseCount = (step.value.split("]").length - 1) - (step.value.split("\\]").length - 1);

                if (brOpenCount !== brCloseCount) {
                    return {
                        error: "Tag Match Error: At least one tag bracket does not have a matching bracket.",
                        line: step.line,
                    }
                }

                let openingCount = 0;
                let closingCount = 0;

                for (let i = 0; i < step.length; i++) {
                    if (step.getCharAt(i) === '[' && step.getCharAt(i - 1) !== '\\') {
                        openingCount++;
                    } else if (step.getCharAt(i) === ']' && step.getCharAt(i - 1) !== '\\') {
                        closingCount++;
                    }
                    if (openingCount > closingCount + 1) {
                        return {
                            error: "Tag Nest Error: Tags cannot be nested inside of dynamic types.",
                            line: step.line,
                        };
                    }
                }

                if (openingCount !== closingCount) {
                    return {
                        error: "Tag Match Error: At least one tag bracket does not have a matching bracket.",
                        line: step.line,
                    }
                }

                tagCount = openingCount;

                const escapedLine = step.value.replace("%", "\\%")

                accessors[step.name] = this.tokenize(escapedLine);

                for (const tagVar of accessors[step.name].ids) {
                    // Check if the tag variable exists or if it is a special dynamic character.
                    if (!storage.has(tagVar) && !['#', '&', '^', '@', '*', '-', ':'].some(char => { return tagVar.includes(char) })) {
                        return {
                            error: "Undeclared Variable Error: The variable \"" + tagVar + "\" does not exist.",
                            line: step.line,
                        }
                    }
                }

                result = this.computeDynamic(accessors, accessors[step.name]);

            } else {

                // Randomly select an element from the list type, and then perform the same operations as the variable type.

                const randomElement = this.parseList(step.value,step.line);

                const brOpenCount = (randomElement.split("[").length - 1) - (randomElement.split("\\[").length - 1);
                const brCloseCount = (randomElement.split("]").length - 1) - (randomElement.split("\\]").length - 1);

                if (brOpenCount !== brCloseCount) {
                    return {
                        error: "Tag Match Error: At least one tag bracket does not have a matching bracket.",
                        line: step.line,
                    }
                }

                let openingCount = 0;
                let closingCount = 0;

                for (let i = 0; i < step.length; i++) {
                    if (step.getCharAt(i) === '[' && step.getCharAt(i - 1) !== '\\') {
                        openingCount++;
                    } else if (step.getCharAt(i) === ']' && step.getCharAt(i - 1) !== '\\') {
                        closingCount++;
                    }
                    if (openingCount > closingCount + 1) {
                        return {
                            error: "Tag Nest Error: Tags cannot be nested inside of dynamic types.",
                            line: step.line,
                        };
                    }
                }

                if (openingCount !== closingCount) {
                    return {
                        error: "Tag Match Error: At least one tag bracket does not have a matching bracket.",
                        line: step.line,
                    }
                }

                tagCount = openingCount;

                const escapedLine = randomElement.replace("%", "\\%")

                accessors[step.name] = this.tokenize(escapedLine,step.line);

                for (const tagVar of accessors[step.name].ids) {
                    // Check if the tag variable exists or if it is a special dynamic character.
                    if (!storage.has(tagVar) && !['#', '&', '^', '@', '*', '-', ':'].some(char => { return tagVar.includes(char) })) {
                        return {
                            error: "Undeclared Variable Error: The variable \"" + tagVar + "\" does not exist.",
                            line: step.line,
                        }
                    }
                }

                result = this.computeDynamic(accessors, accessors[step.name]);
            }

            if (step.type === 'variable') {
                storage.set(step.name, step.value);
            } else if (step.type === 'list') {
                storage.set(step.name, step.value);
            } else if (step.type === 'result') {
                if (result.error) {
                    return result;
                }
                return this.unify(result);
            }
        }
    }
}