import Home from './pages/Home/Home.jsx'
import Planner from './pages/Planner/Planner.jsx'
import PageNotFound from './pages/PageNotFound/PageNotFound.jsx'
import Notification from './pages/Notification/Notification.jsx'
import Footer from './components/Footer/Footer.jsx'
import { Theme } from '@radix-ui/themes'
import { useState, useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") ? localStorage.getItem("theme") : "light")
  const [bgTheme, setBgTheme] = useState("bg-dark")
  
  const router = createBrowserRouter([
    {path:"/", element:<Home theme={theme} setTheme={setTheme}/>, errorElement:<PageNotFound setTheme={setTheme}/>},
    {path:"/planner", element:<Planner theme={theme} setTheme={setTheme}/>},
    {path:"/notification", element:<Notification theme={theme} setTheme={setTheme}/>}
  ])

  useEffect(() => {
    if (theme === "dark") {
      document.getElementById("sun-icon").setAttribute("style", "display: none")
      document.getElementById("moon-icon").setAttribute("style", "display: inline")
      setBgTheme("bg-dark")
    } else {
      document.getElementById("sun-icon").setAttribute("style", "display: inline")
      document.getElementById("moon-icon").setAttribute("style", "display: none")
      setBgTheme("bg-light")
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <>
      <Theme className={bgTheme} appearance={theme} accentColor='sky'>
        <RouterProvider router={router} />
        <Footer />
      </Theme>
    </>
  )
}

export default App

