import React, {useContext, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/userContext'

const Logout = () => {
  const {currentUser, setCurrentUser} = useContext(UserContext)

  useEffect(() => {
    setCurrentUser(null)
  }, [])
  
  const navigate = useNavigate()
  navigate('/login')
  return (
    <div></div>
  )
}

export default Logout