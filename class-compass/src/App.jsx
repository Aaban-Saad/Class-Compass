import Home from './pages/Home/Home.jsx'
import Planner from './pages/Planner/Planner.jsx'
import PageNotFound from './pages/PageNotFound/PageNotFound.jsx'
import Notification from './pages/Notification/Notification.jsx'
import Footer from './components/Footer/Footer.jsx'
import { Theme } from '@radix-ui/themes'
import { useState, useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") ? localStorage.getItem("theme") : "dark")
  const [bgTheme, setBgTheme] = useState("bg-dark")
  
  // Data from rds2
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const router = createBrowserRouter([
    {path:"/", element:<Home setTheme={setTheme}/>, errorElement:<PageNotFound setTheme={setTheme}/>},
    {path:"/planner", element:<Planner setTheme={setTheme}/>},
    {path:"/notification", element:<Notification setTheme={setTheme}/>}
  ])
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/fetch-html')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.text()
        setData(result)
        console.log(result)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    };

    fetchData()
  }, [])


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
        <RouterProvider router={router}/>
        <Footer />
      </Theme>
    </>
  )
}

export default App

