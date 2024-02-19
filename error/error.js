export default  (err, req, res, next)=>{
    console.log("error is " , err.error, "hir")

    res.status(err.statusCode).json({
        name : err.message,
        statusCode : err.statusCode,
        error : `${err.error}`,
    })
}
