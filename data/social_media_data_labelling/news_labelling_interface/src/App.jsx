import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CSVLabelingTool from './all'

function App() {
  const [count, setCount] = useState(0)

  return (
    <CSVLabelingTool/>
  )
}

export default App
