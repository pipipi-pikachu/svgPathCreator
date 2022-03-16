import { useMemo } from 'react'
import { useSelector, useDispatch, IndexModelState } from 'umi'
import style from './index.less'
import SVGEditor from '@/components/SVGEditor'
import CanvasTools from '@/components/CanvasTools'
import PathTypeSetting from '@/components/PathTypeSetting'

import { PathItem } from '@/types'

export default function IndexPage() {
  const {
    closePath,
    activePointIndex,
    paths,
  } = useSelector(({ index }: { index: IndexModelState }) => index)
  const dispatch = useDispatch()

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
    return paths[activePointIndex[0]]
  }, [paths, activePointIndex])

  const activePointItem = useMemo(() => {
    return activePathItem.points[activePointIndex[1]]
  }, [activePathItem, activePointIndex])

  function setPathItem(pathItem: PathItem) {
    dispatch({
      type: 'index/save',
      payload: {
        paths: paths.map((item, index) => activePointIndex[0] === index ? pathItem : item),
      },
    })
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
    const path = paths[activePointIndex[0]]
    const points = path.points.map((item, index) => {
      if (index === activePointIndex[1]) {
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
        activePathItem={activePathItem}
        pathString={pathString}
        setPathItem={setPathItem}
        setPointPosition={setPointPosition}
        setQuadraticPosition={setQuadraticPosition}
        setCubicPosition={setCubicPosition}
      />

      <CanvasTools
        pathString={pathString}
      />

      <PathTypeSetting
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