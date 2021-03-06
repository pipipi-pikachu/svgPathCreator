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
        ??? ?? ??????
        <Tooltip title="????????????">
          <div className={style.canvasSize} onClick={() => setCanvasSizeSettingVisible(true)}>
            {canvasWidth}
            <span style={{ margin: '0 6px' }}>??</span>
            {canvasHeight}
          </div>
        </Tooltip>

        <Tooltip title="????????????">
          <MinusOutlined className={classNames([style.icon, style.size])} onClick={reduceScale} />
        </Tooltip>
        {Math.round(scale * 100) + '%'}
        <Tooltip title="????????????">
          <PlusOutlined className={classNames([style.icon, style.size])} onClick={increaseScale} />
        </Tooltip>

        <Tooltip title="????????????">
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
        
        <Tooltip title="??????SVG??????">
          <DownloadOutlined className={style.icon} style={{ fontSize: '16px' }} onClick={exportSVGFile} />
        </Tooltip>
        
        <CopyToClipboard text={pathString} onCopy={() => message.success('?????????????????????')}>
          <Tooltip title="??????SVG??????">
            <CopyOutlined className={style.icon} style={{ fontSize: '16px' }} />
          </Tooltip>
        </CopyToClipboard>
        
        <Tooltip title="??????">
          <QuestionCircleOutlined className={style.icon} style={{ fontSize: '16px' }} onClick={() => setHelpVisible(true)} />
        </Tooltip>
      </div>

      <Modal 
        title="????????????"
        okText="??????"
        cancelText="??????"
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
            ??????
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
            ??????
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
            ?????????
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
            >??????</Checkbox>
          </div>
        </div>
      </Modal>

      <Modal 
        title="????????????"
        footer={null}
        centered
        visible={helpVisible} 
        width={760}
        onCancel={() => setHelpVisible(false)}
      >
        <p>????????????????????????????????????????????????????????????</p>
        <p>???????????????????????????????????????????????????????????????????????????</p>
        <p>???????????????????????????????????????????????????</p>
        <p>???????????????????????????????????????</p>
        <p>???????????????????????????????????????</p>
        <p>Delete / Backspace???????????????????????????????????????????????????</p>
        <p>???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????</p>
      </Modal>
    </>
  )
}