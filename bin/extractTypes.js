"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var fs = require("fs");
var fileName = "./plt.ts"; // Update this to the path of your TypeScript file
var typeName = "plt"; // Update this to the name of the type you want to inspect
// Read the file content
var sourceCode = fs.readFileSync(fileName).toString();
// Create a SourceFile object
var sourceFile = ts.createSourceFile(fileName, sourceCode, ts.ScriptTarget.Latest, true);
// Create a program and type checker to get type information
var program = ts.createProgram([fileName], {});
var checker = program.getTypeChecker();
// Function to find the specified type in the file
function findType(typeName, node) {
    if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
        var type = checker.getTypeAtLocation(node.name);
        if (type) {
            console.log("Properties of type ".concat(typeName, ":"));
            type.getProperties().forEach(function (prop) {
                console.log("- ".concat(prop.name));
            });
        }
    }
    ts.forEachChild(node, function (child) { return findType(typeName, child); });
}
// Start the search
findType(typeName, sourceFile);
