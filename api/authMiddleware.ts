// authenticateToken.ts
import jwt, { Secret } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';




// const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
//   const token = req.header('Authorization');

//   // Check if JWT_SECRET is defined
//   if (!process.env.JWT_SECRET) {
//     console.error('JWT_SECRET is not defined.');
//     return res.sendStatus(500);
//   }

//   // Explicitly assert the type of process.env.JWT_SECRET as a string
//   const jwtSecret: Secret = process.env.JWT_SECRET as string;

//   if (!token) return res.sendStatus(401);

//   jwt.verify(token, jwtSecret, (err, user) => {
//     if (err) {
//       console.error('Error verifying token:', err);
//       return res.sendStatus(403);
//     }
//     const user  = req;
//     // Assuming 'user' is of type any; you may want to define a specific type for it
//     req.user = user;
//     next();
//   });
// };

// export default authenticateToken;
