import React from 'react'
import { useNavigate } from 'react-router-dom'
import Usernavbar1 from './Usernavbar1';
import axios from "axios";


const Roomhome = () => {
    const navigate=useNavigate();
    const handleCreateRoom= () => {
        navigate(`/room/${Date.now()}`);
    }

  return (
  
    <div>
       
         <br></br>
         Roomhome
    <button onClick={handleCreateRoom}>Create Room</button>
    </div>
  )
}

export default Roomhome