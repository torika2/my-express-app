import jwt from 'jsonwebtoken'
// Middleware to verify JWT token
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'
export default (req, res, next)=>{
    const token = req.headers['authorization'] // Get token from headers
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' })
    }
    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' })
        }
        req.user = decoded // Store user data in request object
        next() // Move to the next middleware or route
    })
}