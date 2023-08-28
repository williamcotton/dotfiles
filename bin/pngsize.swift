import Foundation
import CoreImage

// Read PNG image from standard input
let inputImageData = FileHandle.standardInput.readDataToEndOfFile()
guard !inputImageData.isEmpty, let inputImage = CIImage(data: inputImageData) else {
    fatalError("Failed to create CIImage from input data")
}

// Get dimensions of input image
let inputExtent = inputImage.extent
let inputWidth = Int(inputExtent.width)
let inputHeight = Int(inputExtent.height)

// Print dimensions of input image
print("Input image dimensions: \(inputWidth) x \(inputHeight)")
