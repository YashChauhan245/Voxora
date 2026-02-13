import React from 'react'
import HomePage from './pages/HomePage'
import { Routes, Route } from "react-router";

const App = () => {
  return (
    <div className='bg-red-500 h-screen text-5xl'>App
     <Routes>
      <Route path="/" element={<HomePage/>}/>
     </Routes>
    </div>
  )
}

export default App