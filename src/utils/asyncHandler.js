    const asyncHandler = (fn)=>{ 
        return (req,res,next)=>{
            Promise.resolve(fn(req,res,next)).catch((err)=>next(err))
        }   
    }

    export {asyncHandler}

    // Uses of the Async Handler :-asyncHandler function is designed to simplify the handling of asynchronous operations and errors within Express.js middleware. When you use this middleware to wrap other middleware or route handlers, you can write asynchronous code without explicitly handling Promise rejections, as any errors will automatically be passed to the Express error-handling mechanism.

    //const asyncHandler = ()=>{}
    // const asyncHandler = (func)=>{
    //     async()=>{
    //         
    //     }}
    //              OR
   // const asyncHandler = (func)=>async()=>{}

//    const asyncHandler = (fn)=>{
//             async (req,res,next)=>{
//                 try {
//                     await fn(req,res,next)
//                 } catch (error) {
//                     res.status(error.code||500).json({
//                         success:false,
//                         message:mesage.error
//                     })
//                 }
//             }

//    }