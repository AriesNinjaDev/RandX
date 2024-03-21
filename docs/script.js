
function code(id,content) {
    var display = CodeMirror.fromTextArea(document.getElementById(id), {
        lineNumbers: true,
        mode: 'text/x-perl',
        matchBrackets: true,
        theme: 'cobalt',
        readOnly: true,
    });
    display.getDoc().setValue(content);
    return display;
}

code('d1',`// My vehicle generator

_amount: 3

list vehicles:
- car
- truck
- "hot air balloon"
- spaceship %10
- \\"megatron\\"

result:
I want [1-6] [vehicles]s please!`)
