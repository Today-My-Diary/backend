import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader) {
            return res.status(401).json({ message: "Authorization header missing "});
        }

        const token = authHeader.split(" ")[1];
        if(!token) {
            return res.status(401).json({ message: "Token missing "});
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        console.log("decoded payload: ", payload);
        req.auth = payload;
        next();
    } catch(error){
        console.log("JWT 검증 실패", error.message);
        return res.status(401).json({ message: "Invalid or expired token "});
    }
}