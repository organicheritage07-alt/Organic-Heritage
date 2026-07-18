import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import AOS from 'aos'
import 'aos/dist/aos.css'

// Initialize AOS
AOS.init({
    duration: 800,
    once: false,        // Animation works both ways (scroll up/down)
    offset: 100,
    easing: 'ease-out',
    mirror: true,       // Elements animate out when scrolling past
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)