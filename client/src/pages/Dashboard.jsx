import React, { useState, useContext, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { UserContext } from '../context/userContext'
import Loader from '../components/Loader'
import axios from 'axios'

const Dashboard = () => {
  const {id} = useParams()
  const [posts,setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false);

  const {currentUser} = useContext(UserContext)
  const token = currentUser?.token;

  const navigate = useNavigate();

  useEffect(() =>{
    if(!token) {
      navigate('/login')
    }
  }, [])

  useEffect(() => {
    const fetchPosts = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get(`${process.env.REACT_APP_URL}/posts/users/${id}`, {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
            setPosts(response.data)
        } catch (error) {
            console.log(error)
        }
        setIsLoading(false)
    }

    fetchPosts()
}, [id])

if(isLoading) {
  return <Loader/>
}


const removePost = async (postId) => {
  try {
      const response = await axios.delete(`${process.env.REACT_APP_URL}/posts/${postId}`, {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
      navigate(0)
  } catch (error) {
      console.log(error)
  }
}

  return (
    <section className='dashboard'>
      {posts.length ? <div className='container dashboard_container'>
        { posts.map(post => {
            return <article key={post._id} className='dashboard_post'>
              <div className='dashboard_post_info'>
                <div className='dashboard_post_thumbnail'>
                <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${post.thumbnail}`} alt="" />
                </div>
                <h5>{post.title}</h5>
              </div>
              <div className='dashboard_post_actions'>
                <Link to={`/posts/${post._id}`} className='btn sm'>View</Link>
                <Link to={`/posts/${post._id}/edit`} className='btn primary sm'>Edit</Link>
                <Link onClick={() => removePost(post._id)} className='btn danger sm'>Delete</Link>
              </div>
            </article>
          })
        }
      </div> : <h2 className='center'> No Posts Available </h2>
    }

  </section>
  )
}

export default Dashboard