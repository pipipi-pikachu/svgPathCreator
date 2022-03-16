import { useState, useEffect } from 'react'
import { IndexModelState, useDispatch, useSelector } from 'umi'
import { useSetState } from 'ahooks'
import classNames from 'classnames'
import { saveAs } from 'file-saver'
import { CopyToClipboard } from "react-copy-to-clipboard";
import style from './index.less'

import { InputNumber, Modal, Checkbox, Tooltip, message } from 'antd'
import {
  MinusOutlined,
  PlusOutlined,
  ExpandOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
  CopyOutlined,
} from '@ant-design/icons'

interface CanvasToolsProps {
  pathString: string;
}

export default function CanvasTools(props: CanvasToolsProps) {
  const {
    canvasWidth,
    canvasHeight,
    gridSize,
    grid,
    scale,
  } = useSelector(({ index }: { index: IndexModelState }) => index)
  const dispatch = useDispatch()

  const { pathString } = props

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
    const newScale = scale + 0.1 > 2 ? 2 : scale + 0.1
    dispatch({
      type: 'index/save',
      payload: { scale: newScale },
    })
  }
  function reduceScale() {
    const newScale = scale - 0.1 < 0.5 ? 0.5 : scale - 0.1
    dispatch({
      type: 'index/save',
      payload: { scale: newScale },
    })
  }

  function resetPosition() {
    dispatch({
      type: 'index/save',
      payload: { canvasPosition: [0, 0] },
    })
  }

  function exportSVGFile() {
    const svg = `
      <svg 
        viewBox="0 0 ${canvasWidth} ${canvasHeight}" 
        width="${canvasWidth}" 
        height="${canvasHeight}" 
        version="1.1" 
        xmlns="http://www.w3.org/2000/svg" 
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <path d="${pathString}" fill="none" stroke="#555" stroke-width="4px" ></path>
      </svg>
    `

    const blob = new Blob([svg], { type: '' });
    saveAs(blob, 'svg.svg')
  }

  return (
    <>
      <div className={style.canvasTools}>
        宽 × 高：
        <Tooltip title="设置画布">
          <div className={style.canvasSize} onClick={() => setCanvasSizeSettingVisible(true)}>
            {canvasWidth}
            <span style={{ margin: '0 6px' }}>×</span>
            {canvasHeight}
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
              dispatch({
                type: 'index/save',
                payload: { scale: 1 },
              })
              resetPosition()
            }}
          />
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
          dispatch({
            type: 'index/save',
            payload: {
              canvasWidth: configs.width,
              canvasHeight: configs.height,
              gridSize: configs.gridSize,
              grid: configs.grid,
            },
          })
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