const editor = CodeMirror.fromTextArea(document.getElementById('code'), {
    lineNumbers: true,
    mode: 'text/x-perl',
    matchBrackets: true,
    theme: 'cobalt',
});

const out = CodeMirror.fromTextArea(document.getElementById('out'), {
    lineNumbers: true,
    mode: 'text/x-perl',
    matchBrackets: true,
    theme: 'cobalt',
    readOnly: true,
});

out.getDoc().setValue('None');

const generator = new rscript();

function execute() {
    let x = editor.getValue();
    // alert(x);
    generator.compile(x);
}