import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'

function Planner(props) {
  return (
    <>
      <Navbar theme={props.theme} setTheme={props.setTheme} page="planner"/>
      <div>Planner</div>
      <Link to="/">Home</Link>
      <Link to="/planner">Planner</Link>
    </>
  )
}

export default Planner