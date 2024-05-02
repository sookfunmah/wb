import React, { useState, useEffect } from 'react'
import PostItem from '../components/PostItem'
import Loader from '../components/Loader'
import axios from 'axios'
import { useParams } from 'react-router-dom'

const AuthorPosts = () => {
  const {id} = useParams()
  const [posts,setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() =>{
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_URL}/posts/users/${id}`)
        setPosts(response.data)
      } catch (err) {
        console.log(err)
      }
      setIsLoading(false)
    }
    fetchPosts();
  },[])

  if(isLoading) {
    return <Loader/>
  }

  return <section className='user_posts'>
      {posts.length ? <div className='container posts_container'>
      {posts.map(({_id:id, thumbnail, category, title, description, creator, createdAt})=> <PostItem key={id} postID ={id} thumbnail={thumbnail} category={category} title={title} description={description} authorID={creator} createdAt={createdAt}/>)}
      </div> : <h2 className='center'> No Posts Found</h2>}
    </section>
}

export default AuthorPosts