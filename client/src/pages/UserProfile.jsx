import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiEdit } from 'react-icons/fi'
import { BiCheck } from 'react-icons/bi'
import axios from 'axios'
import { UserContext } from '../context/userContext'

const UserProfile = () => {
    const [avatarTouched, setAvatarTouched] = useState(false)
    const [avatar, setAvatar] = useState('')
    
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [error, setError] = useState('')

    const navigate = useNavigate();

    const {currentUser} = useContext(UserContext)
    const token = currentUser?.token;

    useEffect(() => {
        if(!token) {
        navigate('/login')
        }
    }, [])

    const {id} = useParams()

    useEffect(() => {
        const getUser = async () => {
            const response = await axios.get(`${process.env.REACT_APP_URL}/users/${id}`, {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
            const {name, email, avatar} = response.data
            setName(name)
            setEmail(email)
            setAvatar(avatar)
        }
        getUser()
    }, [])

    const changeAvatarHandler = async () => {
        setAvatarTouched(false);
        try {
            const postData = new FormData()
            postData.set('avatar', avatar);
            const response = await axios.post(`${process.env.REACT_APP_URL}/users/change-avatar`, postData, {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
            setAvatar(response?.data.avatar)
        } catch (error) {
            setError(error.response.data.message)
            console.log(error)
        }
    }
    const updateUserDetail = async (e) => {
        try {
            e.preventDefault()
            const userData = new FormData()
            userData.set('name', name)
            userData.set('email', email)
            userData.set('currentPassword', currentPassword)
            userData.set('newPassword', newPassword)
            userData.set('confirmNewPassword', confirmNewPassword)
    
            const response = await axios.patch(`${process.env.REACT_APP_URL}/users/edit-user`, userData, {withCredentials: true, headers: {
                Authorization: `Bearer ${token}`
            }})
    
            if(response.status === 200) {
                navigate('/logout')
            }
        } catch (error) {
            setError(error.response.data.message)
        }
    }
    
  return (
    <section className='profile'>
      <div className='container profile_container'>
        <Link to={`/myposts/${currentUser?.id}`} className='btn'>My Posts</Link>
        <div className='profile_details'>
          <div className='avatar_wrapper'>
            <div className='profile_avatar'>
            <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${avatar}`} alt="" />
            </div>
            {/*Form */}
            <form className='avatar_form'>
                <input type="file" id='avatar' name='avatar' onChange={e => setAvatar(e.target.files[0])} accept="png, jpg, jpeg" />
                <label htmlFor="avatar" value={avatarTouched} onClick={() => setAvatarTouched(!avatarTouched)}><FiEdit/></label>
            </form>
            {avatarTouched && <button type="submit" className='profile_avatar_btn' onClick={changeAvatarHandler}><BiCheck/></button>}
          </div>
          <h1>{name}</h1>

          {/* form to update user details */}
          <form className='form profile_form' onSubmit={updateUserDetail}>
            {error && <p className='form_error_message'>{error}</p>}
            <input type='text' placeholder='Full Name' value={name} onChange={e => setName(e.target.value)} />
            <input type='email' placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} />
            <input type='password' placeholder='Current Password' value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            <input type='password' placeholder='New Password' value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <input type='password' placeholder='Confirm New Password' value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
            <button type='submit' className='btn primary'>Update Details</button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default UserProfile