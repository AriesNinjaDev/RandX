function code(id, content) {
    var display = CodeMirror.fromTextArea(document.getElementById(id), {
        lineNumbers: true,
        lineWrapping: true,
        mode: "text/x-perl",
        matchBrackets: true,
        theme: "cobalt",
        readOnly: true,
    });
    display.getDoc().setValue(content);
    return display;
}

code(
    "d1",
    `// My vehicle generator

_amount: 3

list vehicles:
- car
- truck
- hot air balloon
- spaceship 10%
- megatron 5\\%

result:
I want [1-6] [vehicles]s please!`
);

code("bk1", `list LISTNAME:`);
code("bk2", `result:`);

code(
    "bt1",
    `myVar: 5 // sets myVar to 5
myVar2: [5-10] // sets myVar2 to a random number between 5 and 10
myVar3: [=myVar+myVar2] // sets myVar3 to the sum of myVar and myVar2`
);

code("bt2", `// I am a comment! The generator will ignore me.`);

code(
    "bt3",
    `[myList] // returns a random item from myList
[myVar] // returns the value of myVar
[5-12] // returns a random number between 5 and 12
[###] // returns a random number between 000 and 999
[a-z] // returns a random letter between a and z
[=varA+varB] // returns the sum of varA and varB`
);

code(
    "sv1",
    `_amount: 3 // sets the amount of results produced to 3

_seed = 5 // sets the seed to 5. The seed determines the random results produced. If you want to produce the same results again, use the same seed. Leave seed blank to produce different results each time. The seed cannot be set to a tag.

_alg = $genericPseudo // sets the algorithm to $genericPseudo. This is the default algorithm and is the only one available at the moment. It is a generic pseudo-random number generator. The algorithm cannot be set to a tag.

_export = $textBar // display generator results in the text bar. Other options include $CSV, $JSON, and $XML. The export cannot be set to a tag.`
);

code(
    "rt1",
    `// The following five can be mixed and matched.
[###] // returns 3 random number between 0 and 9
[&&&&] // returns 4 random letters between a and z
[^^^] // returns 3 random letters between A and Z
[@@@@@] // returns 5 random letters between A and Z and a and z
[****] // returns 4 random letters between A and Z, a and z, and 0 and 9

// There is also a way to generate a random number between two values:
[5-12] // returns a random number between 5 and 12
[5-] // returns a random number between 5 and 9 (since 9 is the highest number with the same amount of digits as the number given)
[-12] // returns a random number between 0 and 12`
);

code(
    "rt2",
    `[PLURAL:myVar] // returns s if myVar is not 1
[UPPER:myVar] // returns the uppercase of myVar
[LOWER:myVar] // returns the lowercase of myVar
[CAPS:myVar] // returns the capitalized myVar
[2:myVar] // returns characters after the 2nd character of myVar
[1:myVar:3] // returns the 1st to 3rd characters of myVar (inclusive)`
);

code(
    "rt3",
    `// In myList, apple has a 20% chance of being selected, and banana has a 30% chance of being selected. The rest are equally likely, meaning cherry and orange each have a 25% chance of being selected.
list myList:
- apple 20%
- banana 30%
- cherry
- orange

// You can set items in a list to other variables, tags, or even other lists. 
list myList2:
- [myVar] // the first item of myList2 is a variable called myVar
- [mySmolList] // the second item of myList2 is a random item from mySmolList
- [=myVar+myVar2] // the third item of myList2 is the sum of myVar and myVar2

// If a list item includes a space be sure to wrap it in quotes, otherwise the second word will be treated as an inline modifier.
list myList3:
- "mac n cheese"
- spaghetti
- "chicken noodle soup" 10%

// To use quotes or brackets asa characters in a list item be sure to prefix them with a backslash.
list myList4:
- "I want a \\"car\\" please!" // returns "I want a "car" please!"
- "I want a [truck] please!" // returns a random truck
- "I want a \[cow\] please!" // returns "I want a [cow] please!"`
);
