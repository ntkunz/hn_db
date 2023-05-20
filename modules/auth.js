import jwt from 'jsonwebtoken'

// Create jwt token based off of user
export const createJWT = (user) => {
   const token = jwt.sign(
      {
         id: user.id,
         email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
   )
   return token
   }

   export const protect = () => { 
      const bearer = req.headers.authorization;

      
   }