import Navbar from "../../components/Navbar/Navbar"

function Notification(props) {
  return (
    <>
      <Navbar theme={props.theme} setTheme={props.setTheme} page="notification" />
      Notification
    </>
  )
}

export default Notification