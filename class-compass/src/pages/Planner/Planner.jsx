import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'

function Planner(props) {
  return (
    <>
      <Navbar setTheme={props.setTheme} page="planner"/>
      <div>Planner</div>
      <Link to="/">Home</Link>
      <Link to="/planner">Planner</Link>
    </>
  )
}

export default Planner