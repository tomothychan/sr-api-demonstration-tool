import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import ApiStoryboardApp from './app/ApiStoryboardApp.jsx'
import StoryboardBuilderApp from './app/StoryboardBuilderApp.jsx'

import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<ApiStoryboardApp />} />
        <Route path="/builder" element={<StoryboardBuilderApp />} />
        <Route path="/*" element={<Navigate to="/" replace />}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)