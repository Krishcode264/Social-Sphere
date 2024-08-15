// export const convertImageTo64bitString = (e: Event) => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       if (reader.readyState == FileReader.DONE) {
//         const data = reader.result;
//         if (typeof data === "string") {
//           const base64String = data.split(",")[1];

//           resolve(base64String);
//         } else {
//           reject(null);
//         }
//       }
//     };
//     reader.onerror = () => {
//       reject(null);
//     };
//     reader.readAsDataURL(e.target.files[0]);
//   });
// };
