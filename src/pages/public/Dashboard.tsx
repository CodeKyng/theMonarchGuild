import { Link } from 'react-router-dom'

function Dashboard() {
  return (
    <div>
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
    </div>
  )
}

export default Dashboard