import * as ts from "typescript";
import * as fs from "fs";

const fileName = "./plt.ts"; // Update this to the path of your TypeScript file
const typeName = "plt"; // Update this to the name of the type you want to inspect

// Read the file content
const sourceCode = fs.readFileSync(fileName).toString();

// Create a SourceFile object
const sourceFile = ts.createSourceFile(
  fileName,
  sourceCode,
  ts.ScriptTarget.Latest,
  true
);

// Create a program and type checker to get type information
const program = ts.createProgram([fileName], {});
const checker = program.getTypeChecker();

// Function to find the specified type in the file
function findType(typeName: string, node: ts.Node) {
  if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
    const type = checker.getTypeAtLocation(node.name);

    if (type) {
      console.log(`Properties of type ${typeName}:`);
      type.getProperties().forEach((prop) => {
        console.log(`- ${prop.name}`);
      });
    }
  }

  ts.forEachChild(node, (child) => findType(typeName, child));
}

// Start the search
findType(typeName, sourceFile);
