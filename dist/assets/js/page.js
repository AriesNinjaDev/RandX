const editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    mode: "null",
    matchBrackets: true,
    theme: "cobalt",
});

const out = CodeMirror.fromTextArea(document.getElementById("out"), {
    lineNumbers: true,
    mode: "null",
    matchBrackets: true,
    theme: "cobalt",
    readOnly: true,
});

out.getDoc().setValue("None");

const generator = new rscript();

function execute() {
    let x = editor.getValue();
    // alert(x);
    result = generator.compile(x);
    if (!result) {
        out.getDoc().setValue("Compiler finished with no output.");
        document
            .querySelectorAll(".CodeMirror-line")
            .forEach(function (element) {
                element.style.color = "red";
            });
        return;
    }
    console.log(result);
    if (result.error) {
        out.getDoc().setValue(`(LINE ${result.line}) ${result.error}`);
        document
            .querySelectorAll(".CodeMirror-line")
            .forEach(function (element) {
                element.style.color = "red";
            });
    }
}

function doClear() {
    out.getDoc().setValue("None");
    editor.getDoc().setValue("");
}

editor.on("change", (args) => {
    document.querySelectorAll(".CodeMirror-line").forEach(function (element) {
        element.style.color = "";
    });
});

document.addEventListener("keydown", function (event) {
    // Check if Ctrl key and Space key are pressed
    if (event.ctrlKey && event.key === " ") {
        // Prevent the default action (e.g., toggling browser-level functions)
        event.preventDefault();

        console.log("Running!");
        execute();
    }
});
