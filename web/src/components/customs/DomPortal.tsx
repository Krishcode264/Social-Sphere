
import React from 'react'
import ReactDOM from 'react-dom';

export type DomPortalProps={
    onClose:()=>void,
    component:JSX.Element
}
const DomPortal = ({onClose,component}:DomPortalProps) => {

  return ReactDOM.createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000
      }}
      onClick={onClose} // Close on overlay click
    >
      {component}
    </div>,
    document.body
  );
};


export default DomPortal