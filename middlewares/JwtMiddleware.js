import jwt from 'jsonwebtoken'
// Middleware to verify JWT token
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'
export default (req, res, next)=>{
    const token = req.cookies.token// Get token from headers
    if (!token) {
        return res.redirect('/login')
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' })
        }
        req.user = decoded // Store user data in request object
        next() // Move to the next middleware or route
    })
}