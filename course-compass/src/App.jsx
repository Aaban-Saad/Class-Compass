import Home from './pages/Home/Home.jsx'
import { ScrollArea } from '@radix-ui/themes'

function App() {

  return (
    <>
      <div id='bg'>
        <ScrollArea size="1" type="always" scrollbars="vertical">
          <Home />
        </ScrollArea>
      </div>
    </>
  )
}

export default App
