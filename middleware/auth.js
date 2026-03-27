import jwt from 'jsonwebtoken'
import logger from '../config/logger.js';

const authUser = async (req, res, next) => {

    const { token } = req.headers;

    if (!token) {
        return res.json({ success: false, message: 'Not authorized, login again' });
    }

    try {

        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        req.body.userId = token_decode.id
        next()

    } catch (error) {
        if (process.env.NODE_ENV !== "test") {
            logger.error({ message: error.message, error });
        }
        res.json({ success: false, message: error.message })
    }

}

export default authUser