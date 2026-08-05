import * as THREE from "three";

export type ProductAnalysis = {
  imageWidth: number;
  imageHeight: number;

  minX: number;
  maxX: number;
  minY: number;
  maxY: number;

  planeWidth: number;
  planeHeight: number;

  offsetX: number;
  offsetY: number;

  visibleWidth: number;
  visibleHeight: number;

  silhouette: Array<
    readonly [number, number]
  >;
};

export const configureProductTexture = (
  texture: THREE.Texture,
) => {
  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.wrapS =
    THREE.ClampToEdgeWrapping;

  texture.wrapT =
    THREE.ClampToEdgeWrapping;

  texture.magFilter =
    THREE.LinearFilter;

  texture.minFilter =
    THREE.LinearMipmapLinearFilter;

  texture.generateMipmaps =
    true;

  texture.anisotropy = 16;

  texture.needsUpdate =
    true;
};

export const createExactProductMaterial = (
  texture: THREE.Texture,
  opacity = 1,
) => {
  const material =
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0,
      depthWrite: true,
      toneMapped: false,
      side: THREE.FrontSide,
      opacity,
    });

  return material;
};

export const analyzeProduct = (
  image: HTMLImageElement,
): ProductAnalysis => {
  const width =
    image.naturalWidth ||
    image.width;

  const height =
    image.naturalHeight ||
    image.height;

  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width = width;
  canvas.height = height;

  const context =
    canvas.getContext(
      "2d",
      {
        willReadFrequently: true,
      },
    );

  if (!context) {
    throw new Error(
      "Unable to analyze product image.",
    );
  }

  context.clearRect(
    0,
    0,
    width,
    height,
  );

  context.drawImage(
    image,
    0,
    0,
    width,
    height,
  );

  const pixels =
    context.getImageData(
      0,
      0,
      width,
      height,
    ).data;

  let minX = width;
  let maxX = -1;
  let minY = height;
  let maxY = -1;

  const leftByRow =
    new Array<number>(
      height,
    ).fill(-1);

  const rightByRow =
    new Array<number>(
      height,
    ).fill(-1);

  for (
    let y = 0;
    y < height;
    y++
  ) {
    let left = -1;
    let right = -1;

    for (
      let x = 0;
      x < width;
      x++
    ) {
      const alpha =
        pixels[
          (
            y * width +
            x
          ) *
            4 +
          3
        ];

      if (alpha > 1) {
        if (left < 0) {
          left = x;
        }

        right = x;

        minX =
          Math.min(
            minX,
            x,
          );

        maxX =
          Math.max(
            maxX,
            x,
          );

        minY =
          Math.min(
            minY,
            y,
          );

        maxY =
          Math.max(
            maxY,
            y,
          );
      }
    }

    leftByRow[y] =
      left;

    rightByRow[y] =
      right;
  }

  if (
    maxX < minX ||
    maxY < minY
  ) {
    throw new Error(
      "No product silhouette found.",
    );
  }

  const visiblePixelsW =
    maxX - minX + 1;

  const visiblePixelsH =
    maxY - minY + 1;

  const visibleHeight =
    5.55;

  const visibleWidth =
    visibleHeight *
    (
      visiblePixelsW /
      visiblePixelsH
    );

  const planeHeight =
    visibleHeight *
    (
      height /
      visiblePixelsH
    );

  const planeWidth =
    planeHeight *
    (
      width /
      height
    );

  const centerX =
    (
      minX +
      maxX +
      1
    ) / 2;

  const centerY =
    (
      minY +
      maxY +
      1
    ) / 2;

  const offsetX =
    -(
      (
        centerX /
        width -
        0.5
      ) *
      planeWidth
    );

  const offsetY =
    (
      centerY /
      height -
      0.5
    ) *
      planeHeight;

  const leftEdge:
    Array<
      readonly [
        number,
        number
      ]
    > = [];

  const rightEdge:
    Array<
      readonly [
        number,
        number
      ]
    > = [];

  const rowStep =
    Math.max(
      1,
      Math.floor(
        visiblePixelsH /
        80,
      ),
    );

  for (
    let y = minY;
    y <= maxY;
    y += rowStep
  ) {
    const left =
      leftByRow[y];

    const right =
      rightByRow[y];

    if (
      left < 0 ||
      right < 0
    ) {
      continue;
    }

    const leftWorldX =
      (
        left / width -
        0.5
      ) *
      planeWidth;

    const rightWorldX =
      (
        right / width -
        0.5
      ) *
      planeWidth;

    const worldY =
      (
        0.5 -
        y / height
      ) *
      planeHeight;

    leftEdge.push([
      leftWorldX,
      worldY,
    ]);

    rightEdge.push([
      rightWorldX,
      worldY,
    ]);
  }

  const silhouette = [
    ...leftEdge,
    ...rightEdge.reverse(),
  ];

  return {
    imageWidth: width,
    imageHeight: height,

    minX,
    maxX,
    minY,
    maxY,

    planeWidth,
    planeHeight,

    offsetX,
    offsetY,

    visibleWidth,
    visibleHeight,

    silhouette,
  };
};

export const createProductPanelGeometry = (
  product: ProductAnalysis,
  u0: number,
  u1: number,
  v0: number,
  v1: number,
) => {
  const x0 =
    (
      u0 -
      0.5
    ) *
    product.planeWidth;

  const x1 =
    (
      u1 -
      0.5
    ) *
    product.planeWidth;

  const y0 =
    (
      v0 -
      0.5
    ) *
    product.planeHeight;

  const y1 =
    (
      v1 -
      0.5
    ) *
    product.planeHeight;

  const positions =
    new Float32Array([
      x0, y0, 0,
      x1, y0, 0,
      x1, y1, 0,

      x0, y0, 0,
      x1, y1, 0,
      x0, y1, 0,
    ]);

  const uvs =
    new Float32Array([
      u0, v0,
      u1, v0,
      u1, v1,

      u0, v0,
      u1, v1,
      u0, v1,
    ]);

  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3,
    ),
  );

  geometry.setAttribute(
    "uv",
    new THREE.BufferAttribute(
      uvs,
      2,
    ),
  );

  geometry.computeVertexNormals();

  return geometry;
};
