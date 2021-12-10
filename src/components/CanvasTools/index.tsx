import { useState, useEffect } from 'react'
import { useSetState } from 'ahooks'
import classNames from 'classnames'
import { saveAs } from 'file-saver'
import style from './index.less'

import { InputNumber, Modal, Checkbox } from 'antd'
import {
  MinusOutlined,
  PlusOutlined,
  ExpandOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'

interface CanvasToolsProps {
  pathString: string;
  canvasWidth: number;
  canvasHeight: number;
  gridSize: number;
  grid: boolean;
  scale: number;
  setGrid: React.Dispatch<React.SetStateAction<boolean>>;
  setCanvasWidth: React.Dispatch<React.SetStateAction<number>>;
  setCanvasHeight: React.Dispatch<React.SetStateAction<number>>;
  setGridSize: React.Dispatch<React.SetStateAction<number>>;
  setPosition: React.Dispatch<React.SetStateAction<{ left: number; top: number }>>;
  setScale: React.Dispatch<React.SetStateAction<number>>;
}

export default function CanvasTools(props: CanvasToolsProps) {
  const {
    pathString,
    canvasWidth,
    canvasHeight,
    gridSize,
    grid,
    scale,
    setGrid,
    setCanvasWidth,
    setCanvasHeight,
    setGridSize,
    setPosition,
    setScale,
  } = props

  const [configs, setConfigs] = useSetState({
    width: 0,
    height: 0,
    gridSize: 0,
    grid: false,
  })

  useEffect(() => {
    setConfigs({
      width: canvasWidth,
      height: canvasHeight,
      gridSize,
      grid,
    })
  }, [canvasWidth, canvasHeight, gridSize, grid])

  const [canvasSizeSettingVisible, setCanvasSizeSettingVisible] = useState(false)
  const [helpVisible, setHelpVisible] = useState(false)

  function increaseScale() {
    setScale(prev => {
      const scale = prev + 0.1
      return scale > 2 ? 2 : scale
    })
  }
  function reduceScale() {
    setScale(prev => {
      const scale = prev - 0.1
      return scale < 0.5 ? 0.5 : scale
    })
  }

  function resetPosition() {
    setPosition({
      top: 0,
      left: 0,
    })
  }

  function exportSVGFile() {
    const svg = `<svg viewBox="0 0 ${canvasWidth} ${canvasHeight}" width="${canvasWidth}" height="${canvasHeight}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="${pathString}"></path></svg>`

    const blob = new Blob([svg], { type: '' });
    saveAs(blob, 'svg.svg')
  }

  return (
    <>
      <div className={style.canvasTools}>
        宽 × 高：
        <div className={style.canvasSize} onClick={() => setCanvasSizeSettingVisible(true)}>
          {canvasWidth}
          <span style={{ margin: '0 6px' }}>×</span>
          {canvasHeight}
        </div>

        <MinusOutlined className={classNames([style.icon, style.size])} onClick={reduceScale} />
        {Math.round(scale * 100) + '%'}
        <PlusOutlined className={classNames([style.icon, style.size])} onClick={increaseScale} />

        <ExpandOutlined 
          className={style.icon} 
          onClick={() => {
            setScale(1)
            resetPosition()
          }}
        />

        <DownloadOutlined className={style.icon} style={{ fontSize: '16px' }} onClick={exportSVGFile} />

        <QuestionCircleOutlined className={style.icon} style={{ fontSize: '16px' }} onClick={() => setHelpVisible(true)} />
      </div>

      <Modal 
        title="画布设置"
        okText="确认"
        cancelText="取消"
        centered
        visible={canvasSizeSettingVisible} 
        width={540}
        onOk={() => {
          setCanvasWidth(configs.width)
          setCanvasHeight(configs.height)
          setGridSize(configs.gridSize)
          setGrid(configs.grid)
          setCanvasSizeSettingVisible(false)
        }} 
        onCancel={() => {
          setConfigs({
            width: canvasWidth,
            height: canvasHeight,
            gridSize,
            grid,
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
              checked={configs.grid}
              onChange={e => setConfigs({ grid: e.target.checked })} 
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
        <p>按下空格键拖拽网格：移动编辑区域；</p>
        <p>点击路径中的点：选中该点；</p>
        <p>拖拽路径中的点：移动该点；</p>
        <p>Delete / Backspace：删除选中的点（除路径起始点外）；</p>
        <p>右上角切换路径类型：更改选中的点与上一个点的连接方式，展开可查看和修改具体数据（除路径起始点外）；</p>
      </Modal>
    </>
  )
}