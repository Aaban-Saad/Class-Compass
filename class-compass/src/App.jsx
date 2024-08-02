import Home from './pages/Home/Home.jsx'
import Footer from './components/Footer/Footer.jsx'
import Navbar from './components/Navbar/Navbar.jsx'
import { Theme } from '@radix-ui/themes'
import { useState, useEffect } from 'react'

function App() {

  const [theme, setTheme] = useState("dark")
  const [bgTheme, setBgTheme] = useState("bg-dark")

  useEffect(() => {
    if (theme === "dark") {
      document.getElementById("sun-icon").setAttribute("style" , "display: none")
      document.getElementById("moon-icon").setAttribute("style", "display: inline")
      setBgTheme("bg-dark")
    } else {
      document.getElementById("sun-icon").setAttribute("style" , "display: inline")
      document.getElementById("moon-icon").setAttribute("style", "display: none")
      setBgTheme("bg-light")
    }
  }, [theme])

  return (
    <>
      <Theme className={bgTheme} appearance={theme} accentColor='sky'>
        <Navbar setTheme = {setTheme} />
        <Home />
        <Footer />
      </Theme>
    </>
  )
}

export default App
