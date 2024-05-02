import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../context/userContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const DeletePost = () => {

  const {id} = useParams;

  useEffect(() => {
    const removePost = async () => {
      try {
          const response = await axios.delete(`${process.env.REACT_APP_URL}/posts/${id}`)

      } catch (error) {
          console.log(error)
      }
  }

  removePost()
}, [])

  return (
    <div></div>
  )
}

export default DeletePost