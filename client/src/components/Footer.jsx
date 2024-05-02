import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer>
      <ul className='footer_categories'>
        <li><Link to="/posts/categories/Software Engineer">Software Engineer</Link></li>
        <li><Link to="/posts/categories/Data Analytics">Data Analytics</Link></li>
        <li><Link to="/posts/categories/Data Science">Data Science</Link></li>
        <li><Link to="/posts/categories/Digital Marketing">Digital Marketing</Link></li>
        <li><Link to="/posts/categories/Product Management">Product Management</Link></li>
      </ul>
      <div className='footer_copyright'>
        <small>All Rights Reserved &copy; Copyright, General Assembly.</small>
      </div>

    </footer>
  )
}

export default Footer