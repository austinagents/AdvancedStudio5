import Foundation
import AppKit
import SceneKit
import Metal

guard CommandLine.arguments.count == 3 else {
    fputs("Usage: render-usdz-product.swift input.usdz output.png\n", stderr)
    exit(1)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])

let scene: SCNScene

do {
    scene = try SCNScene(url: inputURL, options: nil)
} catch {
    fputs("Could not load USDZ: \(error)\n", stderr)
    exit(1)
}

/*
 * Transparent background.
 *
 * This is important because Advanced Studio 5's existing
 * product geometry derives its silhouette from image alpha.
 */
scene.background.contents = NSColor.clear

var minX = CGFloat.greatestFiniteMagnitude
var minY = CGFloat.greatestFiniteMagnitude
var minZ = CGFloat.greatestFiniteMagnitude

var maxX = -CGFloat.greatestFiniteMagnitude
var maxY = -CGFloat.greatestFiniteMagnitude
var maxZ = -CGFloat.greatestFiniteMagnitude

var foundGeometry = false

func includePoint(_ point: SCNVector3) {
    minX = min(minX, point.x)
    minY = min(minY, point.y)
    minZ = min(minZ, point.z)

    maxX = max(maxX, point.x)
    maxY = max(maxY, point.y)
    maxZ = max(maxZ, point.z)
}

/*
 * Calculate the real bounds of all geometry in the USDZ.
 */
scene.rootNode.enumerateChildNodes { node, _ in
    guard node.geometry != nil else {
        return
    }

    foundGeometry = true

    let bounds = node.boundingBox

    let corners = [
        SCNVector3(bounds.min.x, bounds.min.y, bounds.min.z),
        SCNVector3(bounds.max.x, bounds.min.y, bounds.min.z),
        SCNVector3(bounds.min.x, bounds.max.y, bounds.min.z),
        SCNVector3(bounds.max.x, bounds.max.y, bounds.min.z),

        SCNVector3(bounds.min.x, bounds.min.y, bounds.max.z),
        SCNVector3(bounds.max.x, bounds.min.y, bounds.max.z),
        SCNVector3(bounds.min.x, bounds.max.y, bounds.max.z),
        SCNVector3(bounds.max.x, bounds.max.y, bounds.max.z),
    ]

    for corner in corners {
        let rootPoint =
            node.convertPosition(
                corner,
                to: scene.rootNode
            )

        includePoint(rootPoint)
    }
}

guard foundGeometry else {
    fputs("USDZ contains no renderable geometry.\n", stderr)
    exit(1)
}

let width = maxX - minX
let height = maxY - minY
let depth = maxZ - minZ

let center = SCNVector3(
    (minX + maxX) * 0.5,
    (minY + maxY) * 0.5,
    (minZ + maxZ) * 0.5
)

let largestDimension =
    max(
        width,
        max(
            height,
            depth
        )
    )

guard largestDimension > 0 else {
    fputs("USDZ geometry has invalid bounds.\n", stderr)
    exit(1)
}

/*
 * Camera.
 *
 * Orthographic projection avoids perspective distortion and
 * creates the clean product view expected by the existing
 * Advanced Studio geometry pipeline.
 */
let cameraNode = SCNNode()
let camera = SCNCamera()

camera.usesOrthographicProjection = true

/*
 * Add framing margin around the product.
 */
camera.orthographicScale =
    Double(
        max(
            width,
            height
        ) * 0.62
    )

camera.zNear = 0.001
camera.zFar =
    Double(
        largestDimension * 30
    )

cameraNode.camera = camera

cameraNode.position = SCNVector3(
    center.x,
    center.y,
    center.z +
        largestDimension * 4
)

cameraNode.look(
    at: center
)

scene.rootNode.addChildNode(
    cameraNode
)

/*
 * Neutral product lighting.
 */
let ambientNode = SCNNode()
let ambient = SCNLight()

ambient.type = .ambient
ambient.intensity = 650
ambient.color = NSColor.white

ambientNode.light = ambient

scene.rootNode.addChildNode(
    ambientNode
)

let keyNode = SCNNode()
let key = SCNLight()

key.type = .directional
key.intensity = 1100
key.color = NSColor.white

keyNode.light = key

keyNode.eulerAngles = SCNVector3(
    -0.65,
    0.55,
    0
)

scene.rootNode.addChildNode(
    keyNode
)

let fillNode = SCNNode()
let fill = SCNLight()

fill.type = .directional
fill.intensity = 550
fill.color = NSColor(
    calibratedRed: 0.85,
    green: 0.9,
    blue: 1.0,
    alpha: 1
)

fillNode.light = fill

fillNode.eulerAngles = SCNVector3(
    0.35,
    -0.8,
    0
)

scene.rootNode.addChildNode(
    fillNode
)

/*
 * Render a high-resolution transparent PNG.
 */
guard let device =
    MTLCreateSystemDefaultDevice()
else {
    fputs("No Metal device available.\n", stderr)
    exit(1)
}

let renderer =
    SCNRenderer(
        device: device,
        options: nil
    )

renderer.scene = scene
renderer.pointOfView = cameraNode

let image =
    renderer.snapshot(
        atTime: 0,
        with: CGSize(
            width: 2048,
            height: 2048
        ),
        antialiasingMode: .multisampling4X
    )

guard
    let tiff = image.tiffRepresentation,
    let bitmap = NSBitmapImageRep(data: tiff),
    let png =
        bitmap.representation(
            using: .png,
            properties: [:]
        )
else {
    fputs("Could not encode rendered product as PNG.\n", stderr)
    exit(1)
}

do {
    try png.write(
        to: outputURL,
        options: .atomic
    )
} catch {
    fputs("Could not write PNG: \(error)\n", stderr)
    exit(1)
}

print(outputURL.path)
