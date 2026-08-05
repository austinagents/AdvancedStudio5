import CoreImage
import CoreVideo
import CoreGraphics
import Foundation
import Vision

enum BackgroundRemovalError: LocalizedError {
  case invalidArguments
  case noForeground
  case sourceImageFailed
  case maskCreationFailed
  case emptyMask
  case pngEncodingFailed

  var errorDescription: String? {
    switch self {
    case .invalidArguments:
      return "Expected input and output image paths."
    case .noForeground:
      return "Apple Vision could not identify a foreground product."
    case .sourceImageFailed:
      return "The source product image could not be loaded."
    case .maskCreationFailed:
      return "The product mask could not be created."
    case .emptyMask:
      return "The refined product mask is empty."
    case .pngEncodingFailed:
      return "The transparent product image could not be encoded."
    }
  }
}

struct MaskResult {
  let buffer: CVPixelBuffer
  let bounds: CGRect
}

func trimMaskTopBottomOnePixel(_ pixelBuffer: CVPixelBuffer) throws {
  CVPixelBufferLockBaseAddress(pixelBuffer, [])

  defer {
    CVPixelBufferUnlockBaseAddress(pixelBuffer, [])
  }

  guard
    let address = CVPixelBufferGetBaseAddress(pixelBuffer)
  else {
    throw BackgroundRemovalError.maskCreationFailed
  }

  let width = CVPixelBufferGetWidth(pixelBuffer)
  let height = CVPixelBufferGetHeight(pixelBuffer)
  let bytesPerRow = CVPixelBufferGetBytesPerRow(pixelBuffer)

  let base =
    address.assumingMemoryBound(to: UInt8.self)

  /*
   * FINAL SILHOUETTE CLEANUP
   *
   * Sides stay untouched.
   * Remove two alpha rows from only the
   * TOP and BOTTOM of each product column.
   */
  for x in 0..<width {
    var top = -1
    var bottom = -1

    for y in 0..<height {
      let row =
        base.advanced(
          by: y * bytesPerRow
        )

      if row[x] > 0 {
        top = y
        break
      }
    }

    if top < 0 {
      continue
    }

    for y in stride(
      from: height - 1,
      through: 0,
      by: -1
    ) {
      let row =
        base.advanced(
          by: y * bytesPerRow
        )

      if row[x] > 0 {
        bottom = y
        break
      }
    }

    for offset in 0...5 {
      let ty = top + offset
      let by = bottom - offset

      if ty >= 0 && ty < height {
        let row =
          base.advanced(
            by: ty * bytesPerRow
          )

        row[x] = 0
      }

      if by >= 0 && by < height && by != ty {
        let row =
          base.advanced(
            by: by * bytesPerRow
          )

        row[x] = 0
      }
    }
  }
}

func erodeMaskOnePixel(_ pixelBuffer: CVPixelBuffer) throws {
  CVPixelBufferLockBaseAddress(pixelBuffer, [])

  defer {
    CVPixelBufferUnlockBaseAddress(pixelBuffer, [])
  }

  guard let address = CVPixelBufferGetBaseAddress(pixelBuffer) else {
    throw BackgroundRemovalError.maskCreationFailed
  }

  let width = CVPixelBufferGetWidth(pixelBuffer)
  let height = CVPixelBufferGetHeight(pixelBuffer)
  let bytesPerRow = CVPixelBufferGetBytesPerRow(pixelBuffer)

  let base =
    address.assumingMemoryBound(to: UInt8.self)

  var source =
    [UInt8](
      repeating: 0,
      count: width * height
    )

  for y in 0..<height {
    let row =
      base.advanced(
        by: y * bytesPerRow
      )

    for x in 0..<width {
      source[y * width + x] = row[x]
    }
  }

  for y in 0..<height {
    let row =
      base.advanced(
        by: y * bytesPerRow
      )

    for x in 0..<width {
      var minimum: UInt8 = 255

      for dy in -1...1 {
        for dx in -1...1 {
          let sx = x + dx
          let sy = y + dy

          if
            sx < 0 ||
            sx >= width ||
            sy < 0 ||
            sy >= height
          {
            minimum = 0
            continue
          }

          minimum = min(
            minimum,
            source[sy * width + sx]
          )
        }
      }

      row[x] = minimum
    }
  }
}

func makeSolidProductMask(
  visionMask: CVPixelBuffer,
  width: Int,
  height: Int,
  context: CIContext
) throws -> MaskResult {
  var outputBuffer: CVPixelBuffer?

  let attributes: [CFString: Any] = [
    kCVPixelBufferCGImageCompatibilityKey: true,
    kCVPixelBufferCGBitmapContextCompatibilityKey: true,
    kCVPixelBufferIOSurfacePropertiesKey: [:]
  ]

  let status =
    CVPixelBufferCreate(
      kCFAllocatorDefault,
      width,
      height,
      kCVPixelFormatType_OneComponent8,
      attributes as CFDictionary,
      &outputBuffer
    )

  guard
    status == kCVReturnSuccess,
    let maskBuffer = outputBuffer
  else {
    throw BackgroundRemovalError.maskCreationFailed
  }

  var visionImage =
    CIImage(
      cvPixelBuffer: visionMask
    )

  if
    visionImage.extent.width != CGFloat(width) ||
    visionImage.extent.height != CGFloat(height)
  {
    let sx =
      CGFloat(width) /
      visionImage.extent.width

    let sy =
      CGFloat(height) /
      visionImage.extent.height

    visionImage =
      visionImage.transformed(
        by: CGAffineTransform(
          scaleX: sx,
          y: sy
        )
      )
  }

  visionImage =
    visionImage.cropped(
      to: CGRect(
        x: 0,
        y: 0,
        width: width,
        height: height
      )
    )

  context.render(
    visionImage,
    to: maskBuffer,
    bounds: CGRect(
      x: 0,
      y: 0,
      width: width,
      height: height
    ),
    colorSpace: CGColorSpaceCreateDeviceGray()
  )

  CVPixelBufferLockBaseAddress(maskBuffer, [])

  guard
    let address = CVPixelBufferGetBaseAddress(maskBuffer)
  else {
    CVPixelBufferUnlockBaseAddress(maskBuffer, [])
    throw BackgroundRemovalError.maskCreationFailed
  }

  let bytesPerRow =
    CVPixelBufferGetBytesPerRow(maskBuffer)

  let base =
    address.assumingMemoryBound(to: UInt8.self)

  let threshold: UInt8 = 24

  /*
   * Make each detected product scanline solid.
   * Vision determines only the exterior silhouette.
   */
  for y in 0..<height {
    let row =
      base.advanced(
        by: y * bytesPerRow
      )

    var left = -1
    var right = -1

    for x in 0..<width {
      if row[x] >= threshold {
        left = x
        break
      }
    }

    guard left >= 0 else {
      continue
    }

    for x in stride(
      from: width - 1,
      through: 0,
      by: -1
    ) {
      if row[x] >= threshold {
        right = x
        break
      }
    }

    guard right >= left else {
      continue
    }

    if right - left > 2 {
      for x in (left + 1)..<right {
        row[x] = 255
      }
    }
  }

  CVPixelBufferUnlockBaseAddress(maskBuffer, [])

  /*
   * Keep the sharp 3-pass exterior cleanup.
   */
  try erodeMaskOnePixel(maskBuffer)
  try erodeMaskOnePixel(maskBuffer)
  try erodeMaskOnePixel(maskBuffer)

  // Final targeted cleanup: top and bottom only.
  try trimMaskTopBottomOnePixel(maskBuffer)

  /*
   * Find the ACTUAL final alpha bounds after refinement.
   */
  CVPixelBufferLockBaseAddress(maskBuffer, [])

  defer {
    CVPixelBufferUnlockBaseAddress(maskBuffer, [])
  }

  guard
    let finalAddress =
      CVPixelBufferGetBaseAddress(maskBuffer)
  else {
    throw BackgroundRemovalError.maskCreationFailed
  }

  let finalBase =
    finalAddress.assumingMemoryBound(
      to: UInt8.self
    )

  var minX = width
  var maxX = -1
  var minY = height
  var maxY = -1

  for y in 0..<height {
    let row =
      finalBase.advanced(
        by: y * bytesPerRow
      )

    for x in 0..<width {
      if row[x] > 0 {
        minX = min(minX, x)
        maxX = max(maxX, x)
        minY = min(minY, y)
        maxY = max(maxY, y)
      }
    }
  }

  guard
    maxX >= minX,
    maxY >= minY
  else {
    throw BackgroundRemovalError.emptyMask
  }

  /*
   * Tiny transparent safety margin.
   * Enough for antialiasing, not enough to waste texture resolution.
   */
  let padding = 2

  minX = max(0, minX - padding)
  minY = max(0, minY - padding)
  maxX = min(width - 1, maxX + padding)
  maxY = min(height - 1, maxY + padding)

  /*
   * Core Image uses a bottom-left origin.
   */
  let cropWidth =
    maxX - minX + 1

  let cropHeight =
    maxY - minY + 1

  /*
   * AS5 effective product resolution diagnostic.
   *
   * This measures REAL product pixels, not the transparent
   * source canvas dimensions.
   */
  FileHandle.standardError.write(
    Data(
      "AS5 product resolution: \(cropWidth)x\(cropHeight) px\n".utf8
    )
  )

  let coreImageY =
    height - maxY - 1

  let bounds =
    CGRect(
      x: minX,
      y: coreImageY,
      width: cropWidth,
      height: cropHeight
    )

  return MaskResult(
    buffer: maskBuffer,
    bounds: bounds
  )
}

func removeBackground(
  inputURL: URL,
  outputURL: URL
) throws {
  guard
    let sourceImage =
      CIImage(
        contentsOf: inputURL,
        options: [
          .applyOrientationProperty: true
        ]
      )
  else {
    throw BackgroundRemovalError.sourceImageFailed
  }

  let handler =
    VNImageRequestHandler(
      url: inputURL
    )

  let request =
    VNGenerateForegroundInstanceMaskRequest()

  try handler.perform([request])

  guard
    let observation =
      request.results?.first,
    !observation.allInstances.isEmpty
  else {
    throw BackgroundRemovalError.noForeground
  }

  let visionMask =
    try observation.generateScaledMaskForImage(
      forInstances:
        observation.allInstances,
      from: handler
    )

  let width =
    Int(sourceImage.extent.width)

  let height =
    Int(sourceImage.extent.height)

  let context =
    CIContext(
      options: [
        .useSoftwareRenderer: false
      ]
    )

  let result =
    try makeSolidProductMask(
      visionMask: visionMask,
      width: width,
      height: height,
      context: context
    )

  let maskImage =
    CIImage(
      cvPixelBuffer:
        result.buffer
    )
    .cropped(
      to: sourceImage.extent
    )

  let transparent =
    CIImage(
      color: CIColor(
        red: 0,
        green: 0,
        blue: 0,
        alpha: 0
      )
    )
    .cropped(
      to: sourceImage.extent
    )

  /*
   * Original uploaded RGB.
   * Mask affects alpha only.
   */
  var outputImage =
    sourceImage.applyingFilter(
      "CIBlendWithMask",
      parameters: [
        kCIInputBackgroundImageKey:
          transparent,
        kCIInputMaskImageKey:
          maskImage
      ]
    )

  /*
   * CRITICAL QUALITY FIX:
   * tightly crop away unused transparent canvas.
   *
   * This gives the bottle substantially more effective
   * texture resolution when Three.js displays it.
   */
  outputImage =
    outputImage.cropped(
      to: result.bounds
    )

  /*
   * Move crop origin back to 0,0.
   */
  outputImage =
    outputImage.transformed(
      by: CGAffineTransform(
        translationX:
          -result.bounds.origin.x,
        y:
          -result.bounds.origin.y
      )
    )

  let colorSpace =
    CGColorSpace(
      name: CGColorSpace.sRGB
    )!

  guard
    let png =
      context.pngRepresentation(
        of: outputImage,
        format: .RGBA8,
        colorSpace: colorSpace
      )
  else {
    throw BackgroundRemovalError.pngEncodingFailed
  }

  try png.write(
    to: outputURL,
    options: .atomic
  )
}

do {
  guard
    CommandLine.arguments.count == 3
  else {
    throw BackgroundRemovalError.invalidArguments
  }

  try removeBackground(
    inputURL: URL(
      fileURLWithPath:
        CommandLine.arguments[1]
    ),
    outputURL: URL(
      fileURLWithPath:
        CommandLine.arguments[2]
    )
  )
} catch {
  FileHandle.standardError.write(
    Data(
      "\(error.localizedDescription)\n".utf8
    )
  )

  exit(1)
}
