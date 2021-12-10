import { useMemo, useState } from 'react'
import style from './index.less'
import SVGEditor from '@/components/SVGEditor'
import CanvasTools from '@/components/CanvasTools'
import PathTypeSetting from '@/components/PathTypeSetting'

import { PathItem } from '@/types'

export default function IndexPage() {
  const [canvasWidth, setCanvasWidth] = useState(2000)
  const [canvasHeight, setCanvasHeight] = useState(1000)
  const [scale, setScale] = useState(1)
  const [gridSize, setGridSize] = useState(20)
  const [grid, setGrid] = useState(true)

  const [closePath] = useState(false)
  const [activePoint, setActivePoint] = useState<[number, number]>([0, 0])

  const [paths, setPaths] = useState<PathItem[]>([
    {
      points: [{ x: 0, y: 0 }],
      closePath: false,
      color: '#000',
      width: 4,
      fill: '#000',
    },
  ])

  const pathString = useMemo(() => {
    let _path = ''

    for (const path of paths) {
      path.points.forEach((point, index) => {
        if (index === 0) _path += 'M '
        else if (point.q) _path += `Q ${point.q.x} ${point.q.y} `
        else if (point.c) _path += `C ${point.c[0].x} ${point.c[0].y} ${point.c[1].x} ${point.c[1].y} `
        else if (point.a) _path += `A ${point.a.rx} ${point.a.ry} ${point.a.rot} ${point.a.laf} ${point.a.sf} `
        else _path += 'L '
        _path += `${point.x} ${point.y} `
      })

      if (path.closePath) _path += 'Z '
    }

    return _path
  }, [paths, closePath])

  const activePathItem = useMemo(() => {
    return paths[activePoint[0]]
  }, [paths, activePoint])

  const activePointItem = useMemo(() => {
    return activePathItem.points[activePoint[1]]
  }, [activePathItem, activePoint])

  const [position, setPosition] = useState({
    left: 0,
    top: 0,
  })

  function setPathItem(pathItem: PathItem) {
    setPaths(prev => prev.map((item, index) => activePoint[0] === index ? pathItem : item))
  }

  function setPointPosition(x: number, y: number) {
    const path = paths[activePoint[0]]
    const points = path.points.map((item, index) => {
      if (index === activePoint[1]) return { ...item, x, y }
      return item
    })
    setPathItem({ ...path, points })
  }

  function setQuadraticPosition(x: number, y: number) {
    const path = paths[activePoint[0]]
    const points = path.points.map((item, index) => {
      if (index === activePoint[1]) return { ...item, q: { x, y } }
      return item
    })
    setPathItem({ ...path, points })
  }

  function setCubicPosition(x: number, y: number, anchor: 0 | 1) {
    const path = paths[activePoint[0]]
    const points = path.points.map((item, index) => {
      if (index === activePoint[1]) {
        const c = item.c || []
        c[anchor] = { x, y }
        return { ...item, c }
      }
      return item
    })
    setPathItem({ ...path, points })
  }

  function inputPointPosition(type: 'x' | 'y', value: number) {
    if (type === 'x') setPointPosition(value, activePointItem.y)
    else setPointPosition(activePointItem.x, value)
  }

  function inputQuadraticPosition(type: 'x' | 'y', value: number) {
    if (!activePointItem.q) return
    if(type === 'x') setQuadraticPosition(value, activePointItem.q.y)
    else setQuadraticPosition(activePointItem.q.x, value)
  }
  
  function inputCubicPosition(type: 'x' | 'y', value: number, anchor: 0 | 1) {
    if (!activePointItem.c) return
    if(type === 'x') setCubicPosition(value, activePointItem.c[anchor].y, anchor)
    else setCubicPosition(activePointItem.c[anchor].x, value, anchor)
  }

  function inputArcParam(key: 'rx' | 'ry' | 'rot' | 'laf' | 'sf', value: number) {
    if(key === 'rot') {
      if(value < 0) value = 0
      if(value > 360) value = 360
    }
    const path = paths[activePoint[0]]
    const points = path.points.map((item, index) => {
      if (index === activePoint[1]) {
        const a = item.a
        if (!a) return item
        a[key] = value
        return { ...item, a }
      }
      return item
    })
    setPathItem({ ...path, points })
  }

  return (
    <div className={style.indexPage}>
      <SVGEditor
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        gridSize={gridSize}
        grid={grid}
        activePoint={activePoint}
        activePathItem={activePathItem}
        paths={paths}
        pathString={pathString}
        position={position}
        scale={scale}
        setActivePoint={setActivePoint}
        setPathItem={setPathItem}
        setPaths={setPaths}
        setPointPosition={setPointPosition}
        setQuadraticPosition={setQuadraticPosition}
        setCubicPosition={setCubicPosition}
        setPosition={setPosition}
      />

      <CanvasTools
        pathString={pathString}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        gridSize={gridSize}
        grid={grid}
        setGrid={setGrid}
        scale={scale}
        setCanvasWidth={setCanvasWidth}
        setCanvasHeight={setCanvasHeight}
        setGridSize={setGridSize}
        setPosition={setPosition}
        setScale={setScale}
      />

      <PathTypeSetting
        activePoint={activePoint}
        activePathItem={activePathItem}
        activePointItem={activePointItem}
        setPathItem={setPathItem}
        inputPointPosition={inputPointPosition}
        inputQuadraticPosition={inputQuadraticPosition}
        inputCubicPosition={inputCubicPosition}
        inputArcParam={inputArcParam}
      />
    </div>
  )
}
