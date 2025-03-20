import React from 'react'
import { useParams } from 'react-router-dom'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { appId,serverSecret } from "./Config";
import Usernavbar1 from './Usernavbar1';
const Room = () => {
    const { roomid } = useParams();
    const meeting = (element) => {
    const token= ZegoUIKitPrebuilt.generateKitTokenForTest(appId,serverSecret,roomid,Date.now().toString(),Date.now().toString());

    const zc=ZegoUIKitPrebuilt.create(token);
    zc.joinRoom({
        container : element,
        scenario:{
            mode:ZegoUIKitPrebuilt.OneONoneCall
        },
        showScreenSharingButton:false,
        sharedLinks:[{
            name:"copylink",
            url: window.location.href

        }]

    });


    };

  return (
    <div>
      
   <Usernavbar1/>
    <div ref={meeting} style={{ width: '100vw', height: '100vh' }}>
       
    </div>
    </div>
  )
}

export default Room