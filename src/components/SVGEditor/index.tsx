import { MouseEvent, useMemo, useRef, useState } from 'react'
import { useClickAway, useKeyPress } from 'ahooks'
import classNames from 'classnames'
import style from './index.less'
import { Menu, Item, Separator, useContextMenu, ItemParams } from 'react-contexify'
import 'react-contexify/dist/ReactContexify.css'

const MENU_ID = 'blahblah';

import { PathItem, PointItem, PointWithAnchorsItem } from '@/types'

interface SVGEditorProps {
  canvasWidth: number;
  canvasHeight: number;
  gridSize: number;
  grid: boolean;
  activePoint: [number, number];
  activePathItem: PathItem;
  paths: PathItem[];
  pathString: string;
  position: { left: number; top: number };
  scale: number,
  setActivePoint: React.Dispatch<React.SetStateAction<[number, number]>>;
  setPathItem: (pathItem: PathItem) => void;
  setPaths: React.Dispatch<React.SetStateAction<PathItem[]>>;
  setPointPosition: (x: number, y: number) => void;
  setQuadraticPosition: (x: number, y: number) => void;
  setCubicPosition: (x: number, y: number, anchor: 0 | 1) => void;
  setPosition: React.Dispatch<React.SetStateAction<{ left: number; top: number }>>;
}

export default function SVGEditor(props: SVGEditorProps) {
  const {
    canvasWidth,
    canvasHeight,
    gridSize,
    grid,
    activePoint,
    activePathItem,
    paths,
    pathString,
    position,
    scale,
    setActivePoint,
    setPathItem,
    setPaths,
    setPointPosition,
    setQuadraticPosition,
    setCubicPosition,
    setPosition,
  } = props

  const svgRef = useRef<SVGSVGElement>(null)
  const svgWrapperRef = useRef<HTMLDivElement>(null)

  const svgOffset = useMemo(() => {
    return {
      x: (scale - 1) * canvasWidth / 2 / scale,
      y: (scale - 1) * canvasHeight / 2 / scale,
    }
  }, [scale])

  const [svgFocus, setSvgFocus] = useState(false)
  useClickAway(() => {
    setSvgFocus(false)
  }, svgWrapperRef)

  const [draggedPoint, setDraggedPoint] = useState(false)
  const [draggedQuadratic, setDraggedQuadratic] = useState(false)
  const [draggedCubic, setDraggedCubic] = useState<false | 0 | 1>(false)

  const [spaceKeyActive, setSpaceKeyActive] = useState(false)
  useKeyPress('space', e => {
    if (e.type === 'keydown') setSpaceKeyActive(true)
    if (e.type === 'keyup') setSpaceKeyActive(false)
  }, { events: ['keydown', 'keyup'] })

  const gridLines = useMemo(() => {
    const lines = []

    for (let i = 1; i < canvasWidth / gridSize; i++) {
      lines.push({
        x1: i * gridSize,
        y1: 0,
        x2: i * gridSize,
        y2: canvasHeight
      })
    }
    for (let i = 1; i < canvasHeight / gridSize; i++) {
      lines.push({
        x1: 0,
        y1: i * gridSize,
        x2: canvasWidth,
        y2: i * gridSize
      })
    }
    return lines
  }, [gridSize, canvasWidth, canvasHeight])

  const pathsPointsWidthAnchors = useMemo(() => {
    return paths.map(path => {
      return path.points.map((point, index) => {
        const last = path.points[index - 1]
        if (point.q) {
          return {
            ...point,
            quadraticAnchors: {
              p1x: last.x,
              p1y: last.y,
              p2x: point.x,
              p2y: point.y,
              x: point.q.x,
              y: point.q.y,
            }
          }
        }
        if (point.c) {
          return {
            ...point,
            cubicAnchors: {
              p1x: last.x,
              p1y: last.y,
              p2x: point.x,
              p2y: point.y,
              x1: point.c[0].x,
              y1: point.c[0].y,
              x2: point.c[1].x,
              y2: point.c[1].y,
            },
          }
        }
        return point
      })
    })
  }, [paths])

  function getMousePosition(e: MouseEvent) {
    if (!svgRef.current) return { x: 0, y: 0 }
    const rect = svgRef.current.getBoundingClientRect()
    
    let x = Math.round(e.pageX - rect.left) / scale
    let y = Math.round(e.pageY - rect.top) / scale

    if (grid) {
      x = gridSize * Math.round(x / gridSize)
      y = gridSize * Math.round(y / gridSize)
    }

    return { x, y }
  }

  function pushNewPoint(newPoint: PointItem) {
    const path = paths[activePoint[0]]
    const newPoints = [...path.points, newPoint]
    const newPathItem = {
      ...path,
      points: newPoints,
    }

    setPathItem(newPathItem)
    setActivePoint([activePoint[0], newPoints.length - 1])
  }

  function addPoint(e: MouseEvent) {
    const newPoint = getMousePosition(e)
    pushNewPoint(newPoint)
  }

  function addQuadraticPoint(e: MouseEvent) {
    const { x, y } = getMousePosition(e)
    const activePointIndex = activePoint[1]

    const newPoint = {
      x,
      y,
      q: {
        x: (x + activePathItem.points[activePointIndex].x) / 2,
        y: (y + activePathItem.points[activePointIndex].y) / 2,
      }
    }
    pushNewPoint(newPoint)
  }

  function addCubicPoint(e: MouseEvent) {
    const { x, y } = getMousePosition(e)
    const activePointIndex = activePoint[1]

    const newPoint = {
      x,
      y,
      c: [{
        x: (x + activePathItem.points[activePointIndex].x - 50) / 2,
        y: (y + activePathItem.points[activePointIndex].y) / 2,
      },
      {
        x: (x + activePathItem.points[activePointIndex].x + 50) / 2,
        y: (y + activePathItem.points[activePointIndex].y) / 2,
      }],
    }
    pushNewPoint(newPoint)
  }

  function addArcPoint(e: MouseEvent) {
    const { x, y } = getMousePosition(e)

    const newPoint = {
      x,
      y,
      a: {
        rx: 50,
        ry: 50,
        rot: 0,
        laf: 1,
        sf: 1,
      },
    }
    pushNewPoint(newPoint)
  }

  function addPath(e: MouseEvent) {
    const newPoint = getMousePosition(e)
    const newPath = {
      points: [newPoint],
      closePath: false,
      color: '#000',
      width: 4,
      fill: '#000',
    }
    setPaths(prev => [...prev, newPath])
    setActivePoint([paths.length, 0])
  }

  function removeActivePoint() {
    if (activePoint[1] === 0) return
    const path = paths[activePoint[0]]
    const newPoints = path.points.filter((item, index) => index !== activePoint[1])
    const newPathItem = {
      ...path,
      points: newPoints,
    }

    setActivePoint([activePoint[0], newPoints.length - 1])
    setPathItem(newPathItem)
  }

  useKeyPress('delete', () => {
    if (svgFocus) removeActivePoint()
  })

  function startDraggingPoint(position: [number, number]) {
    setActivePoint(position)
    setDraggedPoint(true)
  }

  function startDraggedQuadratic(position: [number, number]) {
    setActivePoint(position)
    setDraggedQuadratic(true)
  }

  function startDraggedCubic(position: [number, number], anchor: false | 0 | 1) {
    setActivePoint(position)
    setDraggedCubic(anchor)
  }

  function cancelDragging() {
    setDraggedPoint(false)
    setDraggedQuadratic(false)
    setDraggedCubic(false)
  }

  function movePoint(e: MouseEvent) {
    if (!draggedPoint && !draggedQuadratic && draggedCubic === false) return

    const { x, y } = getMousePosition(e)
    if (draggedPoint) {
      setPointPosition(x, y)
    }
    else if (draggedQuadratic) {
      setQuadraticPosition(x, y)
    }
    else if (draggedCubic !== false) {
      setCubicPosition(x, y, draggedCubic)
    }
  }

  function startDraggingSvg(e: MouseEvent) {
    let draggedSvg = true

    const startPageX = e.pageX
    const startPageY = e.pageY

    const originLeft = position.left
    const originTop = position.top

    document.onmousemove = e => {
      if (!draggedSvg || !spaceKeyActive) return

      const currentPageX = e.pageX
      const currentPageY = e.pageY

      const moveX = currentPageX - startPageX
      const moveY = currentPageY - startPageY

      setPosition({
        left: originLeft + moveX,
        top: originTop + moveY,
      })
    }
    document.onmouseup = () => {
      draggedSvg = false
    }
  }

  interface AnchorProps {
    point: PointWithAnchorsItem;
    position: [number, number];
  }
  function Anchor(props: AnchorProps) {
    const { point, position } = props
    if (!point.quadraticAnchors && !point.cubicAnchors) return null
    if (point.cubicAnchors) {
      return (
        <g className={style.anchor}>
          <line 
            className={style.anchorLine}
            x1={point.cubicAnchors.p1x}
            y1={point.cubicAnchors.p1y}
            x2={point.cubicAnchors.x1}
            y2={point.cubicAnchors.y1}
          ></line>
          <line 
            className={style.anchorLine}
            x1={point.cubicAnchors.p2x}
            y1={point.cubicAnchors.p2y}
            x2={point.cubicAnchors.x2}
            y2={point.cubicAnchors.y2}
          ></line>
          <circle 
            className={style.anchorPoint}
            cx={point.cubicAnchors.x1}
            cy={point.cubicAnchors.y1}
            r={8}
            onMouseDown={e => {
              e.stopPropagation()
              startDraggedCubic(position, 0)
            }}
          ></circle>
          <circle 
            className={style.anchorPoint}
            cx={point.cubicAnchors.x2}
            cy={point.cubicAnchors.y2}
            r={8}
            onMouseDown={e => {
              e.stopPropagation()
              startDraggedCubic(position, 1)
            }}
          ></circle>
        </g>
      )
    }
    else if (point.quadraticAnchors) {
      return (
        <g className={style.anchor}>
          <line
            className={style.anchorLine}
            x1={point.quadraticAnchors.p1x}
            y1={point.quadraticAnchors.p1y}
            x2={point.quadraticAnchors.x}
            y2={point.quadraticAnchors.y}
          ></line>
          <line
            className={style.anchorLine}
            x1={point.quadraticAnchors.x}
            y1={point.quadraticAnchors.y}
            x2={point.quadraticAnchors.p2x}
            y2={point.quadraticAnchors.p2y}
          ></line>
          <circle 
            className={style.anchorPoint} 
            cx={point.quadraticAnchors.x} 
            cy={point.quadraticAnchors.y} 
            r={8} 
            onMouseDown={e => {
              e.stopPropagation()
              startDraggedQuadratic(position)
            }}
          ></circle>
        </g>
      )
    }
    else return null
  }

  const { show } = useContextMenu({
    id: MENU_ID,
  })

  function handleContextMenu(e: MouseEvent){
    e.preventDefault()
    show(e, {
      props: e,
    })
  }

  const handleItemClick = ({ props, data }: ItemParams) => {
    if (data === 'PATH') addPath(props)
    else if(data === 'L') addPoint(props)
    else if(data === 'Q') addQuadraticPoint(props)
    else if(data === 'C') addCubicPoint(props)
    else if(data === 'A') addArcPoint(props)
  }

  function ContextMenu() {
    return (
      <Menu id={MENU_ID} animation={false}>
        <Item data="L" onClick={handleItemClick}>追加直线</Item>
        <Item data="Q" onClick={handleItemClick}>追加二次贝塞尔曲线</Item>
        <Item data="C" onClick={handleItemClick}>追加三次贝塞尔曲线</Item>
        <Item data="A" onClick={handleItemClick}>追加弧线</Item>
        <Separator />
        <Item data="PATH" onClick={handleItemClick}>添加新路径</Item>
      </Menu>
    )
  }

  return (
    <div className={style.svgEditor} onMouseUp={cancelDragging}>
      <ContextMenu />

      <div className={style.canvas} onMouseMove={movePoint}>
        <div 
          className={style.svgWrapper} 
          style={{
            left: position.left + 'px',
            top: position.top + 'px',
          }}
          ref={svgWrapperRef}
          onMouseDown={e => startDraggingSvg(e)}
          onClick={() => setSvgFocus(true)}
          onContextMenu={handleContextMenu}
        >
          <svg 
            className={style.svg} 
            ref={svgRef} 
            width={canvasWidth} 
            height={canvasHeight} 
            onDoubleClick={(e: MouseEvent) => addPoint(e)}
            style={{ transform: `scale(${scale}) translate(${svgOffset.x}px, ${svgOffset.y}px)` }}
          >
            <g className={style.grid}>
              {
                gridLines.map((line, index: number) => (
                  <line key={index} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}></line>
                ))
              }
            </g>

            <path className={style.path} d={pathString}></path>

            <g>
              {
                pathsPointsWidthAnchors.map((points, pathIndex) => (
                  points.map((point, pointIndex) => (
                    <g key={`${pathIndex} - ${pointIndex}`}>
                      <circle
                        className={classNames(style.point, {
                          [style.start]: pointIndex === 0,
                          [style.active]: pathIndex === activePoint[0] && pointIndex === activePoint[1],
                        })}
                        cx={point.x}
                        cy={point.y}
                        r={8}
                        onMouseDown={e => {
                          e.stopPropagation()
                          startDraggingPoint([pathIndex, pointIndex])
                        }}
                      ></circle>

                      <Anchor point={point} position={[pathIndex, pointIndex]} />
                    </g>
                  ))
                ))
              }
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
