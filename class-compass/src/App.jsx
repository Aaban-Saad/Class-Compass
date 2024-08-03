import Home from './pages/Home/Home.jsx'
import Footer from './components/Footer/Footer.jsx'
import Navbar from './components/Navbar/Navbar.jsx'
import { Theme } from '@radix-ui/themes'
import { useState, useEffect } from 'react'

function App() {

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://rds2.northsouth.edu/index.php/common/showofferedcourses')
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

  const [theme, setTheme] = useState("dark")
  const [bgTheme, setBgTheme] = useState("bg-dark")

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
  }, [theme])

  return (
    <>
      <Theme className={bgTheme} appearance={theme} accentColor='sky'>
        <Navbar setTheme={setTheme} />
        <Home />
        <Footer />
      </Theme>
    </>
  )
}

export default App
