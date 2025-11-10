import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

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

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch(error){
        console.log("JWT 검증 실패", error.message);
        return res.status(401).json({ message: "Invalid or expired token "});
    }
}