import React from 'react'
import { useNavigate } from 'react-router-dom'
import Usernavbar1 from './Usernavbar1';


const Roomhome = () => {
    const navigate=useNavigate();
    const handleCreateRoom= () => {
        navigate(`/room/${Date.now()}`);
    }

  return (
  
    <div>
         <Usernavbar1/>
         <br></br>
         Roomhome
    <button onClick={handleCreateRoom}>Create Room</button>
    </div>
  )
}

export default Roomhome