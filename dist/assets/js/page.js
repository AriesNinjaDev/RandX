editor = CodeMirror.fromTextArea(document.getElementById('code'), {
    lineNumbers: true,
    mode: 'text/x-perl',
    matchBrackets: true,
    theme: 'cobalt',
});

out = CodeMirror.fromTextArea(document.getElementById('out'), {
    lineNumbers: true,
    mode: 'text/x-perl',
    matchBrackets: true,
    theme: 'cobalt',
    readOnly: true,
});

out.getDoc().setValue('None');