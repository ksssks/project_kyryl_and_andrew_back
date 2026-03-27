import jwt from 'jsonwebtoken'
import logger from '../config/logger.js';

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers
        if (!token) {
            return res.json({ success: false, message: "Not authorized" })
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: "Not authorized" })
        }
        next()
    } catch (error) {
        if (process.env.NODE_ENV !== "test") {
            logger.error({ message: error.message, error });
        }
        res.json({ success: false, message: error.message })
    }
}

export default adminAuth