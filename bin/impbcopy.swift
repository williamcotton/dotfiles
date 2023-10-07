import Cocoa

func copyToClipboard(path: String) -> Bool {
    guard let image: NSImage = {
        if path == "-" {
            let input = FileHandle.standardInput
            return NSImage(data: input.readDataToEndOfFile())
        } else {
            return NSImage(contentsOfFile: path)
        }
    }() else {
        return false
    }
    
    let pasteboard = NSPasteboard.general
    pasteboard.clearContents()
    let copiedObjects = [image]
    let copied = pasteboard.writeObjects(copiedObjects)
    return copied
}

let arguments = CommandLine.arguments
if arguments.count < 2 {
    print("""
        Usage:

        Copy file to clipboard:
            ./impbcopy path/to/file

        Copy stdin to clipboard:
            cat /path/to/file | ./impbcopy -
        """)
    exit(EXIT_FAILURE)
}

let path = arguments[1]
let success = copyToClipboard(path: path)
exit(success ? EXIT_SUCCESS : EXIT_FAILURE)