export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // 추후 CustomError 클래스로 관리
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
}