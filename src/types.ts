export interface PointItem {
  x: number
  y: number
  q?: {
    x: number
    y: number
  }
  c?: {
    x: number
    y: number
  }[]
  a?: {
    rx: number
    ry: number
    rot: number
    laf: number
    sf: number
  }
}

export interface PathItem {
  points: PointItem[]
  closePath: boolean
}

export interface PointWithAnchorsItem extends PointItem {
  quadraticAnchors?: {
    p1x: number
    p1y: number
    p2x: number
    p2y: number
    x: number
    y: number
  }
  cubicAnchors?: {
    p1x: number
    p1y: number
    p2x: number
    p2y: number
    x1: number
    y1: number
    x2: number
    y2: number
  };
}