import React, { useState,useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Loader from '../components/Loader'

const Authors = () => {
  const [authors, setAuthors] = useState([])
  const [isLoading, setIsLoading] = useState(false)


  useEffect(() => {
    const getAuthors = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_URL}/users`)
        setAuthors(response.data)
      } catch (error) {
        console.log(error)
      }
      setIsLoading(false)
    }
    getAuthors()
  }, [])


  if (isLoading) {
    return <Loader />
  }

  return (
    <section className='authors'>
      {authors.length > 0 ? <div className='container authors_container'>
           {authors.map(author => {
            return <Link key={author?._id} to={`/posts/users/${author?._id}`} className='author'>
              <div className='authors_avatar'>
                <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${author.avatar}`} alt={`Image of ${author?.name}`} />
              </div>
              <div  className='authors_info'>
                <h4>{author?.name}</h4>
                <p>{author?.posts}</p>
              </div>
            </Link>
          })}
      </div> : <h2 className='center'> No User/Authors found</h2>}
    </section>
  )
}

export default Authors