import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './pages/App'
import reportWebVitals from './reportWebVitals'

import { RecoilRoot } from 'recoil'

import 'antd/dist/antd.less'
import './global.less'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)
root.render(
  <React.StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </React.StrictMode>
)

reportWebVitals()