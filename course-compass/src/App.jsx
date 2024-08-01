import Home from './pages/Home/Home.jsx'
import { ScrollArea } from '@radix-ui/themes'

import Footer from './components/Footer/Footer.jsx'

function App() {

  return (
    <>
      <div id='bg'>
        <ScrollArea size="1" type="always" scrollbars="vertical">
          <Home />
          <Footer />
        </ScrollArea>
      </div>
    </>
  )
}

export default App
