

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
    const result = generator.execute(x);
    if (!result) {
        out.getDoc().setValue("Compiler finished with no output.");
        document
            .querySelectorAll(".CodeMirror-line")
            .forEach(function (element) {
                element.style.color = "blue";
            });
        return false;
    }
    if (result.error) {
        out.getDoc().setValue(`(LINE ${result.line}) ${result.error}`);
        document
            .querySelectorAll(".CodeMirror-line")
            .forEach(function (element) {
                element.style.color = "red";
            });
        return false;
    }
    // temporary solution
    console.log(result);
    out.getDoc().setValue(result.join("\r\n"));
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

var saveData = (function () {
    var a = document.createElement("a");
    return function (textData, fileName) {
        var blob = new Blob([textData], { type: "text/plain" }), // Specify text/plain type for text data
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
})();

var importData = function (callback) {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = ".rscript";

    input.onchange = function (event) {
        var file = event.target.files[0];
        var reader = new FileReader();

        reader.onload = function () {
            var fileContent = reader.result;
            callback(fileContent);
        };

        reader.readAsText(file);
    };

    input.click();
}; // // farizaad

function saveScriptWithTimestamp(scriptContent, filenamePrefix) {
    var currentDate = new Date();
    var dateString = currentDate
        .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
        .replace(/\//g, "-");
    var timeString = currentDate
        .toLocaleTimeString("en-US", { hour12: false })
        .replace(/:/g, "-");
    var filename =
        filenamePrefix + "_" + dateString + "_" + timeString + ".rscript";

    saveData(scriptContent, filename);
}

function doExport() {
    saveScriptWithTimestamp(editor.getValue(), "script");
}

function doImport() {
    importData(function (fileContent) {
        editor.getDoc().setValue(fileContent);
    });
}
