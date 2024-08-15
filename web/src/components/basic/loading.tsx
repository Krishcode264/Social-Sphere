import React from 'react'
import CircularProgress from "@mui/material/CircularProgress";
const Loading = () => {
  return (
    <div className=' h-full flex items-center justify-center  text-rose-500 '>
<CircularProgress sx={{ color: "red", width: "200px", height: "200px" }} />
    </div>
  )
}

export default Loading