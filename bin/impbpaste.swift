import Cocoa

func pasteFromClipboard() -> Data? {
    let pasteboard = NSPasteboard.general
    guard let objects = pasteboard.readObjects(forClasses: [NSImage.self], options: nil),
          let image = objects.first as? NSImage,
          let tiffData = image.tiffRepresentation,
          let bitmap = NSBitmapImageRep(data: tiffData),
          let pngData = bitmap.representation(using: .png, properties: [:])
    else {
        return nil
    }
    return pngData
}

guard let pngData = pasteFromClipboard() else {
    print("Error: Could not read image from clipboard")
    exit(EXIT_FAILURE)
}

FileHandle.standardOutput.write(pngData)