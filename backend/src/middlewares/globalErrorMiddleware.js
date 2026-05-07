const globalErrorMiddleware = (err, req, res, next) => {


    // if (err.code === 11000) {
    //     return res.status(409).json({
    //         success: false,
    //         error: "Duplicate entry",
    //         fields: err.keyValue
    //     });
    // }
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ error: message });
}

module.exports = globalErrorMiddleware;