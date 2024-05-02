import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Register = () => {
  const [userData,setUserData] = useState({
    name:'',
    email:'',
    password:'',
    password2:''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate();
 

  const changeInputHandler = (e) => {
    setUserData(prevState => {
      return { ...prevState, [e.target.name]: e.target.value}
    })
  }

  const registerUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${process.env.REACT_APP_URL}/users/register`, userData);
      const newUser = await response.data; 
      console.log('New User:', newUser);
    
      if(!newUser){
        setError("User exists, please login instead.")
      }
      navigate('/login')
      
    } catch (err) {
      setError(err.response.data.message)
      console.error('Error:', err);
    }
  };
  

  return (
    <section className='register'>
      <div className='container'>
        <h2>Sign Up</h2>
        <form className='form register_form' onSubmit={registerUser}>
          {error && <p className='form_error_message'> {error} </p>}
          <input type= "text" placeholder='Full Name' name= "name" value={userData.name} onChange={changeInputHandler} />
          <input type= "text" placeholder='Email' name= "email" value={userData.email} onChange={changeInputHandler} />
          <input type= "text" placeholder='Password' name= "password" value={userData.password} onChange={changeInputHandler} />
          <input type= "text" placeholder='Confirm Password' name= "password2" value={userData.password2} onChange={changeInputHandler} />        
          <button type= "submit" className='btn primary'>Register</button>
          </form>
        <small>Already have an account? <Link to = "/login">Sign In</Link></small>
      </div>
    </section>
  )
}

export default Register