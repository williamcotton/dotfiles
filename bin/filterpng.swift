import Foundation
import CoreImage
import ImageIO

// Parse command-line arguments
let args = CommandLine.arguments
let filterName = args[1]

// Read PNG image from standard input
let inputImageData = FileHandle.standardInput.readDataToEndOfFile()
guard !inputImageData.isEmpty, let inputImage = CIImage(data: inputImageData) else {
    fatalError("Failed to create CIImage from input data")
}

// Apply Core Image filter
let filter = CIFilter(name: filterName)!
filter.setValue(inputImage, forKey: kCIInputImageKey)

for arg in args[2...] {
    let components = arg.components(separatedBy: "=")
    guard components.count == 2 else {
        continue
    }
    let key = components[0]
    let value = components[1]
    filter.setValue(value, forKey: key)
}

guard let outputImage = filter.outputImage else {
    fatalError("Failed to get output image from filter")
}

// Render filtered image to PNG data
let context = CIContext()
let cgImage = context.createCGImage(outputImage, from: outputImage.extent)!
let outputImageData = NSMutableData()
guard let destination = CGImageDestinationCreateWithData(outputImageData as CFMutableData, "public.png" as CFString, 1, nil) else {
    fatalError("Failed to create CGImageDestination")
}
CGImageDestinationAddImage(destination, cgImage, nil)
guard CGImageDestinationFinalize(destination) else {
    fatalError("Failed to finalize CGImageDestination")
}

// Write filtered PNG image to standard output
FileHandle.standardOutput.write(outputImageData as Data)
