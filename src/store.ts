import { atom, selector } from 'recoil'
import { PathItem } from './types'

export const canvasSizeState = atom({
  key: 'canvasSizeState',
  default: {
    width: 800,
    height: 800,
  },
})

export const scaleState = atom({
  key: 'scaleState',
  default: 1,
})

export const gridSizeState = atom({
  key: 'gridSizeState',
  default: 20,
})

export const gridEnabledState = atom({
  key: 'gridEnabledState',
  default: true,
})

export const activePointIndexState = atom({
  key: 'activePointIndexState',
  default: [0, 0],
})

export const canvasPositionState = atom({
  key: 'canvasPositionState',
  default: [0, 0],
})

export const strokeColorState = atom({
  key: 'strokeColorState',
  default: '#555',
})

export const strokeWidthState = atom({
  key: 'strokeWidthState',
  default: 4,
})

export const fillState = atom({
  key: 'fillState',
  default: 'none',
})

export const pathsState = atom<PathItem[]>({
  key: 'pathsState',
  default: [{
    points: [{
      x: 0,
      y: 0,
    }],
    closePath: false,
  }],
})


export const pathStringState = selector({
  key: 'pathStringState',
  get({ get }) {
    const paths = get(pathsState)

    let pathString = ''

    for (const path of paths) {
      for (let i = 0; i < path.points.length; i++) {
        const point = path.points[i]
        if (i === 0) pathString += 'M '
        else if (point.q) pathString += `Q ${point.q.x} ${point.q.y} `
        else if (point.c) pathString += `C ${point.c[0].x} ${point.c[0].y} ${point.c[1].x} ${point.c[1].y} `
        else if (point.a) pathString += `A ${point.a.rx} ${point.a.ry} ${point.a.rot} ${point.a.laf} ${point.a.sf} `
        else pathString += 'L '
        pathString += `${point.x} ${point.y} `
      }

      if (path.closePath) pathString += 'Z '
    }

    return pathString
  },
})

export const activePathItemState = selector({
  key: 'activePathItemState',
  get({ get }) {
    const paths = get(pathsState)
    const activePointIndex = get(activePointIndexState)

    return paths[activePointIndex[0]]
  },
})

export const activePointItemState = selector({
  key: 'activePointItemState',
  get({ get }) {
    const paths = get(pathsState)
    const activePointIndex = get(activePointIndexState)

    const activePathItem = paths[activePointIndex[0]]

    return activePathItem.points[activePointIndex[1]]
  },
})