import React from 'react'
type LabelProps={
  text:string
  color?:string;
  bg?:string;
  w?:string;
  h?:string;
}

export const Label = ({text,color,bg,w,h}:LabelProps) => {
  const styles = {
    backgroundColor: bg,
    color,
    width:w,
    height:h
  };
  return (
    <span className='label' style={styles}>{text}</span>
  )
}

