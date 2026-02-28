declare module "@mapbox/point-geometry" {
  class Point {
    x: number;
    y: number;
    constructor(x: number, y: number);
  }
  export default Point;
}

declare module "@mapbox/vector-tile" {
  export class VectorTile {
    layers: Record<string, VectorTileLayer>;
    constructor(pbf: unknown);
  }
  export class VectorTileLayer {
    length: number;
    feature(i: number): VectorTileFeature;
  }
  export class VectorTileFeature {
    type: number;
    extent: number;
    properties: Record<string, unknown>;
    loadGeometry(): Array<Array<{ x: number; y: number }>>;
    toGeoJSON(x: number, y: number, z: number): unknown;
  }
}
