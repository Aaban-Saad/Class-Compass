import Navbar from "../../components/Navbar/Navbar"

function Notification(props) {
  return (
    <div style={{minHeight:"100vh"}}>
      <Navbar theme={props.theme} setTheme={props.setTheme} page="notification" />
      Notification
    </div>
  )
}

export default Notification