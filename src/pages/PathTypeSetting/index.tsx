import { useMemo, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { activePointIndexState, activePathItemState, activePointItemState } from '../../store'
import { PathItem, PointItem } from '../../types'
import style from './index.module.less'

import { Radio, InputNumber, Divider, Checkbox } from 'antd'
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons'

interface PathTypeSettingProps {
  setPathItem: (pathItem: PathItem) => void
  inputPointPosition: (type: 'x' | 'y', value: number) => void
  inputQuadraticPosition: (type: 'x' | 'y', value: number) => void
  inputCubicPosition: (type: 'x' | 'y', value: number, anchor: 0 | 1) => void
  inputArcParam: (key: 'rx' | 'ry' | 'rot' | 'laf' | 'sf', value: number) => void
}

export default function PathTypeSetting(props: PathTypeSettingProps) {
  const [activePointIndex] = useRecoilState(activePointIndexState)
  const activePathItem = useRecoilValue(activePathItemState)
  const activePointItem = useRecoilValue(activePointItemState)

  const {
    setPathItem,
    inputPointPosition,
    inputQuadraticPosition,
    inputCubicPosition,
    inputArcParam,
  } = props

  const [open, setOpen] = useState(false)

  const activePathType = useMemo(() => {
    if (activePointItem.q) return 'q'
    if (activePointItem.c) return 'c'
    if (activePointItem.a) return 'a'
    return 'l'
  }, [activePointItem])

  function setPathType(type: string) {
    const index = activePointIndex[1]
    if (index === 0) return

    const newPoints: PointItem[] = JSON.parse(JSON.stringify(activePathItem.points))
    if (type === 'l') {
      newPoints[index] = {
        x: newPoints[index].x,
        y: newPoints[index].y,
      }
    }
    else if (type === 'q') {
      newPoints[index] = {
        x: newPoints[index].x,
        y: newPoints[index].y,
        q: {
          x: (newPoints[index].x + newPoints[index - 1].x) / 2,
          y: (newPoints[index].y + newPoints[index - 1].y) / 2,
        },
      }
    }
    else if (type === 'c') {
      newPoints[index] = {
        x: newPoints[index].x,
        y: newPoints[index].y,
        c: [{
          x: (newPoints[index].x + newPoints[index - 1].x - 50) / 2,
          y: (newPoints[index].y + newPoints[index - 1].y) / 2,
        },
        {
          x: (newPoints[index].x + newPoints[index - 1].x + 50) / 2,
          y: (newPoints[index].y + newPoints[index - 1].y) / 2,
        }],
      }
    }
    else if (type === 'a') {
      newPoints[index] = {
        x: newPoints[index].x,
        y: newPoints[index].y,
        a: {
          rx: 50,
          ry: 50,
          rot: 0,
          laf: 1,
          sf: 1,
        },
      }
    }
    setPathItem({ ...activePathItem, points: newPoints })
  }

  return (
    <div className={style.pathTypeSetting}>
      <div className={style.radio}>
        <Radio.Group value={activePathType} disabled={activePointIndex[1] === 0} onChange={ e => setPathType(e.target.value) }>
          <Radio value="l">直线</Radio>
          <Radio value="q">二次贝塞尔曲线</Radio>
          <Radio value="c">三次贝塞尔曲线</Radio>
          <Radio value="a" style={{ marginRight: 0 }}>弧线</Radio>
        </Radio.Group>

        <Divider type="vertical" />

        <div className={style.toggle} onClick={() => setOpen(!open)}>{ open ? <CaretDownOutlined /> : <CaretRightOutlined /> }</div>
      </div>

      {
        open ? (
          <div className={style.configs}>
            <div className={style.configsLine}>
              <div className={style.configItem}>
                <div className={style.configLabel}>X：</div>
                <InputNumber 
                  className={style.inputNumber} 
                  value={activePointItem.x} 
                  onChange={value => inputPointPosition('x', value)} 
                />
              </div>
              <div className={style.configItem}>
                <div className={style.configLabel}>Y：</div>
                <InputNumber 
                  className={style.inputNumber} 
                  value={activePointItem.y} 
                  onChange={value => inputPointPosition('y', value)} 
                />
              </div>
            </div>

            {
              activePointItem.q ? (
                <div className={style.configsLine}>
                  <div className={style.configItem}>
                    <div className={style.configLabel}>cX：</div>
                    <InputNumber 
                      className={style.inputNumber} 
                      value={activePointItem.q.x} 
                      onChange={value => inputQuadraticPosition('x', value)} 
                    />
                  </div>
                  <div className={style.configItem}>
                    <div className={style.configLabel}>cY：</div>
                    <InputNumber 
                      className={style.inputNumber} 
                      value={activePointItem.q.y} 
                      onChange={value => inputQuadraticPosition('y', value)} 
                    />
                  </div>
                </div>
              ): null
            }

            {
              activePointItem.c ? (
                <div className={style.configsLine}>
                  <div className={style.configItem}>
                    <div className={style.configLabel}>c1X：</div>
                    <InputNumber 
                      className={style.inputNumber} 
                      value={activePointItem.c[0].x} 
                      onChange={value => inputCubicPosition('x', value, 0)} 
                    />
                  </div>
                  <div className={style.configItem}>
                    <div className={style.configLabel}>c1Y：</div>
                    <InputNumber 
                      className={style.inputNumber} 
                      value={activePointItem.c[0].y} 
                      onChange={value => inputCubicPosition('y', value, 0)} 
                    />
                  </div>
                  <div className={style.configItem}>
                    <div className={style.configLabel}>c2X：</div>
                    <InputNumber 
                      className={style.inputNumber} 
                      value={activePointItem.c[1].x} 
                      onChange={value => inputCubicPosition('x', value, 1)} 
                    />
                  </div>
                  <div className={style.configItem}>
                    <div className={style.configLabel}>c2Y：</div>
                    <InputNumber 
                      className={style.inputNumber} 
                      value={activePointItem.c[1].y} 
                      onChange={value => inputCubicPosition('y', value, 1)} 
                    />
                  </div>
                </div>
              ) : null
            }

            {
              activePointItem.a ? (
                <div className={style.configsLine}>
                  <div className={style.configItem}>
                    <div className={style.configLabel}>rX：</div>
                    <InputNumber 
                      className={style.inputNumber} 
                      value={activePointItem.a.rx} 
                      onChange={value => inputArcParam('rx', value)} 
                    />
                  </div>
                  <div className={style.configItem}>
                    <div className={style.configLabel}>rY：</div>
                    <InputNumber 
                      className={style.inputNumber} 
                      value={activePointItem.a.ry} 
                      onChange={value => inputArcParam('ry', value)} 
                    />
                  </div>
                  <div className={style.configItem}>
                    <div className={style.configLabel}>rot：</div>
                    <InputNumber 
                      className={style.inputNumber} 
                      value={activePointItem.a.rot} 
                      onChange={value => inputArcParam('rot', value)} 
                    />
                  </div>
                  <div className={style.configItem}>
                    <Checkbox
                      checked={activePointItem.a.laf === 1}
                      onChange={e => inputArcParam('laf', e.target.checked ? 1 : 0)} 
                    >laf</Checkbox>
                  </div>
                  <div className={style.configItem}>
                    <Checkbox
                      checked={activePointItem.a.sf === 1}
                      onChange={e => inputArcParam('sf', e.target.checked ? 1 : 0)} 
                    >sf</Checkbox>
                  </div>
                </div>
              ) : null
            }
          </div>
        ) : null
      }
    </div>
  )
}
