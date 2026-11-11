import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Maket } from './Maket'
import './maket.css'

// Страница-макет для выбора дизайна интерфейса. Открывается только локально: /maket.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Maket />
  </StrictMode>,
)
