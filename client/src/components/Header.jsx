import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../images/GAlogo.png'
import {FaBars} from "react-icons/fa"
import {AiOutlineClose} from "react-icons/ai"

import { UserContext } from '../context/userContext'


const Header = () => {

  const {currentUser} = useContext(UserContext)
  return (
    <nav>
      <div className="container nav_container">
        <Link to="/" className= 'nav_logo'>
          <img src={Logo} alt="Navbar Logo" />
        </Link>
        {currentUser?.id &&<ul className='nav_menu'>
          <li><Link to={`/profile/${currentUser?.id}`}>{currentUser?.name}</Link></li>
          <li><Link to={'/create'}>Create post</Link></li>
          <li><Link to={'/authors'}>Members</Link></li>
          <li><Link to={'/logout'}>Logout</Link></li>
        </ul>}
        {!currentUser?.id &&<ul className='nav_menu'>
          <li><Link to="/authors">Members</Link></li>
          <li><Link to="/login">Login</Link></li>
        </ul>}
        <button className='nav_toggle_btn'>
          <AiOutlineClose></AiOutlineClose>
        </button>
      </div>
    </nav>
  )
}

export default Header