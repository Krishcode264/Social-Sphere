// import axios from 'axios';
// import React, { useEffect } from 'react'
// import { useRecoilState } from 'recoil'

// export const useFetchAndStore=(api:string,atom:Atom,dependency:[],token:string)=>{
// const [state,setState]=useRecoilState(atom);


// useEffect(()=>{
//   console.log(state.fetched)
//   const fetchStore= async()=>{
//     try {
   
    
//       const data = await axios.get(
//         `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}${api}`,
        
//       );
//       console.log("data came from aopi",data)
//     } catch(err) {
// console.log("error occured ")
//     }
//   }
 
//  fetchStore()

// },dependency)
// }