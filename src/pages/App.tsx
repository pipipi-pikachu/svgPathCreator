import { useRecoilState, useRecoilValue } from 'recoil'
import { activePointIndexState, activePointItemState, pathsState } from '../store'
import { PathItem } from '../types'
import style from './App.module.less'

import SVGEditor from './SVGEditor'
import CanvasTools from './CanvasTools'
import PathTypeSetting from './PathTypeSetting'

export default function App() {
  const [paths, setPaths] = useRecoilState(pathsState)
  const [activePointIndex] = useRecoilState(activePointIndexState)
  const activePointItem = useRecoilValue(activePointItemState)

  function setPathItem(pathItem: PathItem) {
    setPaths(paths.map((item, index) => activePointIndex[0] === index ? pathItem : item))
  }

  function setPointPosition(x: number, y: number) {
    const path = paths[activePointIndex[0]]
    const points = path.points.map((item, index) => {
      if (index === activePointIndex[1]) return { ...item, x, y }
      return item
    })
    setPathItem({ ...path, points })
  }

  function setQuadraticPosition(x: number, y: number) {
    const path = paths[activePointIndex[0]]
    const points = path.points.map((item, index) => {
      if (index === activePointIndex[1]) return { ...item, q: { x, y } }
      return item
    })
    setPathItem({ ...path, points })
  }

  function setCubicPosition(x: number, y: number, anchor: 0 | 1) {
    const path = paths[activePointIndex[0]]
    const points = path.points.map((item, index) => {
      if (index === activePointIndex[1]) {
        let c = item.c!
        if (anchor === 1) c = [c[0], { x, y }]
        else c = [{ x, y }, c[1]]
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
    if (key === 'rot') {
      if(value < 0) value = 0
      if(value > 360) value = 360
    }
    const path = paths[activePointIndex[0]]
    const points = path.points.map((item, index) => {
      if (index === activePointIndex[1]) {
        let a = item.a!
        if (!a) return item
        a = { ...a, [key]: value }
        return { ...item, a }
      }
      return item
    })
    setPathItem({ ...path, points })
  }

  return (
    <div className={style.app}>
      <SVGEditor
        setPathItem={setPathItem}
        setPointPosition={setPointPosition}
        setQuadraticPosition={setQuadraticPosition}
        setCubicPosition={setCubicPosition}
      />

      <CanvasTools setPathItem={setPathItem} />

      <PathTypeSetting
        setPathItem={setPathItem}
        inputPointPosition={inputPointPosition}
        inputQuadraticPosition={inputQuadraticPosition}
        inputCubicPosition={inputCubicPosition}
        inputArcParam={inputArcParam}
      />
    </div>
  )
}