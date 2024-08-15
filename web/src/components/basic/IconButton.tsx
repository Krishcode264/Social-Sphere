import React from 'react'
import { SvgIconProps } from '@mui/material/SvgIcon';
import { Icon } from '@mui/material';
 
type IconBtnProps = {
  bg?: string;
  icon: React.ComponentType<SvgIconProps>;
  br: string;
  color?:string;
  size?:number;
  
};
export const IconBtn:React.FC<IconBtnProps> = ({ bg,color,size, icon:IconComponent, br }) => {
  const styles = {
    backgroundColor: bg,
    borderRadius: br,
    cursor:"pointer",
    color:color ? color:"white"
  };
  return (
    <span style={styles}>
      <Icon sx={{color,fontSize:size}} component={IconComponent} />
    </span>
  );
};

