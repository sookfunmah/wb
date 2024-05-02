import React, { useState, useContext, useEffect } from 'react'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import axios from 'axios';

const EditPosts = () => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Uncategorized')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [error, setError] = useState('')

  const params = useParams()
  const navigate = useNavigate()
  const {currentUser} = useContext(UserContext)
  const token = currentUser?.token;


  useEffect(() =>{
    if(!token) {
      navigate('/login')
    }
  }, [])
 
  const postCategories = ["Data Analytics", "Data Science", "Digital Marketing", "Product Management", "Software Engineer", "Uncategorized"]

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  }

    const formats = [
      'header',
      'bold', ' italic', 'underline', 'strike', 'blockquote',
      'list', 'bullet', 'indent',
      'link', 'image'
    ]

    
    useEffect(() => {
      const getPost = async () => {
          try {
              const response = await axios.get(`${process.env.REACT_APP_URL}/posts/${params.id}`)
              setTitle(response?.data.title)
              setDescription(response?.data.description)

          } catch (error) {
              console.log(error)
              navigate('/login')
          }
  }

  getPost();
  }, [])
  
  const EditPosts = async (e) => {
    e.preventDefault();

    const postData = new FormData();
    postData.set('title', title);
    postData.set('category', category);
    postData.set('description', description);
    postData.set('thumbnail', thumbnail)

    try {
        const response = await axios.patch(`${process.env.REACT_APP_URL}/posts/${params.id}`, postData, {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
        if(response.status == 200) {
            return navigate('/')
        }
    } catch (err) {
        if(err.response.data.message === "TypeError: Cannot read properties of null (reading 'thumbnail')") {
            setError("Please choose a thumbnail")
        } else {
            setError(err.response.data.message);
        }
    }
}

const changeCat = (newCat) => {
    setCategory(newCat)
}


  return (
    <section className='create_post'>
      <div className='container create_post_container'>
        <h2>Edit Post</h2>
        {error && <p className="form_error_message">{error} </p>}
        <form onSubmit={EditPosts} className='form create_post_form'encType="multipart/form-data">
          <input type='text' placeholder='Title' value={title} onChange={e => setTitle(e.target.value)} autoFocus/>
          <select name="category" value={category} onChange={e => setCategory(e.target.value)}>
            {
              postCategories.map(cat => <option key={cat}>{cat}</option>)
            }
          </select> 
          <ReactQuill modules={modules} formats={formats} value={description} onChange={setDescription} />
            <input type='file' onChange={e => setThumbnail(e.target.files[0])} accept='png, jpg, jpeg' />
            <button type='submit' className='btn primary'>Update</button>
        </form>
      </div>
    </section>
  )
}

export default EditPosts