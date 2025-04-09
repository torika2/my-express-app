// middleware/authMiddleware.js
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'

export default(req, res, next) => {
    const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1]

    if (!token) {
        return req.accepts('html')
            ? res.redirect('/login')
            : res.status(401).json({ error: 'Token required' })
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.redirect('/logout')
        }

        req.user = decoded
        next()
    })
}