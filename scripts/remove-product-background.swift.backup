import CoreImage
import Foundation
import ImageIO
import UniformTypeIdentifiers
import Vision

enum BackgroundRemovalError: LocalizedError {
  case invalidArguments
  case noForeground
  case pngEncodingFailed

  var errorDescription: String? {
    switch self {
    case .invalidArguments:
      return "Expected input and output image paths."
    case .noForeground:
      return "Apple Vision could not identify a foreground product."
    case .pngEncodingFailed:
      return "The transparent product image could not be encoded."
    }
  }
}

func removeBackground(inputURL: URL, outputURL: URL) throws {
  let handler = VNImageRequestHandler(url: inputURL)
  let request = VNGenerateForegroundInstanceMaskRequest()
  try handler.perform([request])

  guard
    let observation = request.results?.first,
    !observation.allInstances.isEmpty
  else {
    throw BackgroundRemovalError.noForeground
  }

  let maskedBuffer = try observation.generateMaskedImage(
    ofInstances: observation.allInstances,
    from: handler,
    croppedToInstancesExtent: false
  )
  let image = CIImage(cvPixelBuffer: maskedBuffer)
  let context = CIContext(options: [.useSoftwareRenderer: false])
  let colorSpace = CGColorSpace(name: CGColorSpace.sRGB)!

  guard
    let png = context.pngRepresentation(
      of: image,
      format: .RGBA8,
      colorSpace: colorSpace
    )
  else {
    throw BackgroundRemovalError.pngEncodingFailed
  }

  try png.write(to: outputURL, options: .atomic)
}

do {
  guard CommandLine.arguments.count == 3 else {
    throw BackgroundRemovalError.invalidArguments
  }

  try removeBackground(
    inputURL: URL(fileURLWithPath: CommandLine.arguments[1]),
    outputURL: URL(fileURLWithPath: CommandLine.arguments[2])
  )
} catch {
  FileHandle.standardError.write(
    Data("\(error.localizedDescription)\n".utf8)
  )
  exit(1)
}
