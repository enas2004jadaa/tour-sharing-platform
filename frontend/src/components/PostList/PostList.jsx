import React from 'react'
import PostCard from '../Post/PostCard/PostCard'

function PostList({ tours , selectedCategory, setSelectedCategory }) {
  return (
      <>
        {tours.length > 0 ?<div className='container-post-list'><PostCard tours={tours} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}/></div> : <div className='no-tours'>No Tours Available</div>}
      </>
  )
}

export default PostList