import { useState, useEffect } from 'react'
import { useSetState } from 'ahooks'
import classNames from 'classnames'
import { saveAs } from 'file-saver'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil'
import {
  canvasSizeState,
  scaleState,
  gridSizeState,
  gridEnabledState,
  strokeColorState,
  strokeWidthState,
  fillState,
  canvasPositionState,
  pathStringState,
  activePathItemState,
  pathsState,
  activePointIndexState,
} from '@/store'
import { PathItem } from '@/types'
import style from './index.module.less'

import { ChromePicker } from 'react-color'
import { InputNumber, Modal, Checkbox, Tooltip, Divider, Popover, message, Slider } from 'antd'
import {
  MinusOutlined,
  PlusOutlined,
  ExpandOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
  CopyOutlined,
  StopOutlined,
  DeleteOutlined,
} from '@ant-design/icons'

interface CanvasToolsProps {
  setPathItem: (pathItem: PathItem) => void
}

export default function CanvasTools(props: CanvasToolsProps) {
  const [canvasSize, setCanvasSize] = useRecoilState(canvasSizeState)
  const [gridSize, setGridSize] = useRecoilState(gridSizeState)
  const [gridEnabled, setGridEnabled] = useRecoilState(gridEnabledState)
  const [scale, setScale] = useRecoilState(scaleState)
  const [strokeColor, setStrokeColor] = useRecoilState(strokeColorState)
  const [strokeWidth, setStrokeWidth] = useRecoilState(strokeWidthState)
  const [fill, setFill] = useRecoilState(fillState)
  const setCanvasPosition = useSetRecoilState(canvasPositionState)
  const setPaths = useSetRecoilState(pathsState)
  const setActivePointIndex = useSetRecoilState(activePointIndexState)
  const pathString = useRecoilValue(pathStringState)
  const activePathItem = useRecoilValue(activePathItemState)

  const { setPathItem } = props

  const [configs, setConfigs] = useSetState({
    width: 0,
    height: 0,
    gridSize: 0,
    gridEnabled: false,
  })

  useEffect(() => {
    setConfigs({
      width: canvasSize.width,
      height: canvasSize.height,
      gridSize,
      gridEnabled,
    })
  }, [canvasSize, gridSize, gridEnabled, setConfigs])

  const [canvasSizeSettingVisible, setCanvasSizeSettingVisible] = useState(false)
  const [helpVisible, setHelpVisible] = useState(false)

  function increaseScale() {
    const newScale = scale + 0.1 > 2 ? 2 : scale + 0.1
    setScale(newScale)
  }
  function reduceScale() {
    const newScale = scale - 0.1 < 0.5 ? 0.5 : scale - 0.1
    setScale(newScale)
  }

  function resetPosition() {
    setCanvasPosition([0, 0])
  }

  function exportSVGFile() {
    const svg = `
      <svg 
        viewBox="0 0 ${canvasSize.width} ${canvasSize.height}" 
        width="${canvasSize.width}" 
        height="${canvasSize.height}" 
        version="1.1" 
        xmlns="http://www.w3.org/2000/svg" 
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <path d="${pathString}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="${fill}"></path>
      </svg>
    `

    const blob = new Blob([svg], { type: '' })
    saveAs(blob, 'svg.svg')
  }

  function clearPath() {
    setActivePointIndex([0, 0])
    setPaths([{
      points: [{
        x: 0,
        y: 0,
      }],
      closePath: false,
    }])
  }

  const FillPopover = () => (
    <div>
      <Checkbox
        checked={fill !== 'none'}
        onChange={e => {
          if (e.target.checked) setFill(strokeColor)
          else setFill('none')
        }}
      >打开路径填充</Checkbox>
      <Divider />
      <ChromePicker 
        className={style.colorPicker} 
        color={fill === 'none' ? '#fff' : fill}
        onChangeComplete={color => setFill(color.hex)}
      />
    </div>
  )
  const StrokePopover = () => (
    <div>
      <Checkbox
        checked={activePathItem.closePath}
        onChange={e => {
          setPathItem({ ...activePathItem, closePath: e.target.checked })
        }}
      >自动闭合路径</Checkbox>
      <Divider />
      <Slider min={1} max={12} value={strokeWidth} onChange={value => setStrokeWidth(value)} />
      <Divider />
      <ChromePicker 
        className={style.colorPicker} 
        color={strokeColor}
        onChangeComplete={color => setStrokeColor(color.hex)}
      />
    </div>
  )

  return (
    <>
      <div className={style.canvasTools}>
        <Tooltip title="设置画布">
          <div className={style.canvasSize} onClick={() => setCanvasSizeSettingVisible(true)}>
            {canvasSize.width}
            <span style={{ margin: '0 6px' }}>×</span>
            {canvasSize.height}
          </div>
        </Tooltip>

        <Tooltip title="缩小画布">
          <MinusOutlined className={classNames([style.icon, style.size])} onClick={reduceScale} />
        </Tooltip>
        {Math.round(scale * 100) + '%'}
        <Tooltip title="放大画布">
          <PlusOutlined className={classNames([style.icon, style.size])} onClick={increaseScale} />
        </Tooltip>

        <Tooltip title="还原画布">
          <ExpandOutlined 
            className={style.icon} 
            onClick={() => {
              setScale(1)
              resetPosition()
            }}
          />
        </Tooltip>

        <Divider type="vertical" />

        <Popover content={StrokePopover} trigger="click">
          <div className={classNames([style.icon, style.color])}>
            路径：<div className={style.block} style={{ backgroundColor: strokeColor }}></div>
          </div>
        </Popover>

        <Popover content={FillPopover} trigger="click">
          <div className={classNames([style.icon, style.color])}>
            填充：
            <div className={style.block} style={{ backgroundColor: (fill === 'none' ? 'transparent' : fill), fontSize: '16px' }}>
              { fill === 'none' ? <StopOutlined /> : null }
            </div>
          </div>
        </Popover>

        <Divider type="vertical" />
        
        <Tooltip title="清空路径">
          <DeleteOutlined className={style.icon} style={{ fontSize: '16px' }} onClick={clearPath} />
        </Tooltip>
        
        <Tooltip title="下载SVG文件">
          <DownloadOutlined className={style.icon} style={{ fontSize: '16px' }} onClick={exportSVGFile} />
        </Tooltip>
        
        <CopyToClipboard text={pathString} onCopy={() => message.success('已复制到剪贴板')}>
          <Tooltip title="复制SVG路径">
            <CopyOutlined className={style.icon} style={{ fontSize: '16px' }} />
          </Tooltip>
        </CopyToClipboard>
        
        <Tooltip title="帮助">
          <QuestionCircleOutlined className={style.icon} style={{ fontSize: '16px' }} onClick={() => setHelpVisible(true)} />
        </Tooltip>
      </div>

      <Modal 
        title="画布设置"
        okText="确认"
        cancelText="取消"
        centered
        visible={canvasSizeSettingVisible} 
        width={540}
        onOk={() => {
          setCanvasSize({
            width: configs.width,
            height: configs.height,
          })
          setGridSize(configs.gridSize)
          setGridEnabled(configs.gridEnabled)
          setCanvasSizeSettingVisible(false)
        }} 
        onCancel={() => {
          setConfigs({
            width: canvasSize.width,
            height: canvasSize.height,
            gridSize,
            gridEnabled,
          })
          setCanvasSizeSettingVisible(false)
        }}
      >
        <div className={style.canvasSizeSetting}>
          <div className={style.item}>
            宽：
            <InputNumber 
              className={style.inputNumber} 
              min={200} 
              max={2000} 
              step={100} 
              value={configs.width} 
              onChange={value => setConfigs({ width: value })} 
            />
          </div>
          <div className={style.item}>
            高：
            <InputNumber 
              className={style.inputNumber} 
              min={200} 
              max={2000} 
              step={100} 
              value={configs.height} 
              onChange={value => setConfigs({ height: value })} 
            />
          </div>
          <div className={style.item}>
            网格：
            <InputNumber 
              className={style.inputNumber} 
              min={10} 
              max={100} 
              step={10} 
              value={configs.gridSize} 
              onChange={value => setConfigs({ gridSize: value })} 
            />
            <Checkbox
              checked={configs.gridEnabled}
              onChange={e => setConfigs({ gridEnabled: e.target.checked })} 
              style={{ marginLeft: '10px' }}
            >吸附</Checkbox>
          </div>
        </div>
      </Modal>

      <Modal 
        title="基本操作"
        footer={null}
        centered
        visible={helpVisible} 
        width={760}
        onCancel={() => setHelpVisible(false)}
      >
        <p>网格上打开右键菜单：追加点或追加新路径；</p>
        <p>在网格中双击：在当前路径上追加一个点（直线连接）；</p>
        <p>在网格中双击（按住 Ctrl键）：追加新路径；</p>
        <p>按下空格键拖拽网格：移动编辑区域；</p>
        <p>点击路径中的点：选中该点/路径；</p>
        <p>拖拽路径中的点：移动该点；</p>
        <p>Delete / Backspace：删除选中的点（除路径起始点外）；</p>
        <p>右上角切换路径类型：更改选中的点与上一个点的连接方式，展开可查看和修改具体数据（除路径起始点外）；</p>
      </Modal>
    </>
  )
}