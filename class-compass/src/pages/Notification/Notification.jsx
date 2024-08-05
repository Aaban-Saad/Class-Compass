import Navbar from "../../components/Navbar/Navbar"

function Notification(props) {
  return (
    <>
      <Navbar setTheme={props.setTheme} page="notification" />
      Notification
    </>
  )
}

export default Notification