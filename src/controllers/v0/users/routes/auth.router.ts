// import { Router, Request, Response } from 'express';
// import { User } from '../models/User';
// import { ErrorMessageObject } from '../../../../index.d';
// import Validator from 'validator';
// import jwt from 'jsonwebtoken';
// import { config } from '../../../../config/config';
// import bcrypt from 'bcrypt';
// import { NextFunction } from 'connect';
// import { AnyLengthString } from 'aws-sdk/clients/comprehend';

// const emailError: ErrorMessageObject = {
//     httpCode: 400,
//     auth: false, 
//     message: 'Email is required or malformed'
// };

// const passwordError: ErrorMessageObject = {
//     httpCode: 400,
//     auth: false,        
//     message: 'Password is required'     
// };

// const userLoginError: ErrorMessageObject = {
//     httpCode: 401,
//     auth: false, 
//     message: 'Unauthorized' 
// };

// const userCreatingError: ErrorMessageObject = {
//     httpCode: 422, 
//     auth: false, 
//     message: 'User may already exist' 
// };

// const authValidError: ErrorMessageObject = {
//     httpCode: 401,
//     auth: false, 
//     message: 'Unauthorized'
// };

// const noError: ErrorMessageObject = {
//     httpCode: -1,
//     auth: false,
//     message: ''
// };

// const hasValidEmail = (email: string | undefined) => {
//     return email && Validator.isEmail(email);
// };

// const hasErrorMessage = (errorMessageObject: ErrorMessageObject): boolean => {
//     return errorMessageObject.message !== noError.message;
// };

// const getUserLoginHttpCodeAndErrorMessage = (email: string | undefined, password: string | undefined, user: User | undefined, authValid: boolean): ErrorMessageObject => {

//     if (!hasValidEmail(email)) {
//         return emailError;    
//     }
    
//     if (!password) {
//         return passwordError;
//     }
    
//     if(!user) {
//         return userLoginError;
//     }
    
//     if (!authValid) {
//         return authValidError;
//     }
    
//     return noError;
// };

// const getUserCreatingHttpCodeAndErrorMessage = (email: string | undefined, password: string | undefined, user: User | undefined): ErrorMessageObject => {

//     if (!hasValidEmail(email)) {
//         return emailError;
//     }
    
//     if (!password) {
//         return passwordError;
//     }
    
//     if(user) {
//         return userCreatingError;
//     }
        
//     return noError;
// };

// const generatePassword = async (plainTextPassword: string): Promise<string> => {
//     //@TODO Use Bcrypt to Generated Salted Hashed Passwords
//     const saltRound = 10;
//     return await bcrypt.hash(plainTextPassword, saltRound);
// };
    
// const comparePasswords = async (plainTextPassword: string | undefined, hash: string | undefined): Promise<boolean> => {
//     //@TODO Use Bcrypt to Compare your password to your Salted Hashed Password
//     if (!plainTextPassword || !hash) {
//         return false;
//     }
        
//     return await bcrypt.compare(plainTextPassword, hash);
// };
    
// const generateJWT = (user: User): string => {
//     //@TODO Use jwt to create a new JWT Payload containing
//     return jwt.sign(user.toJSON(), config.jwt.secret);
// };
    
// const getTokenFromTokenBearer = (tokenFromHeader: string): string | null => {
//     const token_bearer = tokenFromHeader.split(' ');
        
//     if (token_bearer.length != 2) {
//         return null;
//     }
        
//     return token_bearer[1];
// };
    
// const hasValidAuthorizationHeader = (req: Request): boolean => {
//     const { authorization } = req.headers
        
//     return authorization !== undefined;
// };

// export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
//     console.warn("auth.router not yet implemented, you'll cover this in lesson 5")
    
//     if (!hasValidAuthorizationHeader(req)) {
//         return res.status(401).send({ message: 'No authorization headers.' });
//     }
        
//     const token = getTokenFromTokenBearer(req.headers.authorization);
        
//     if (!token) {
//         return res.status(401).send({ message: 'Malformed token.' });
//     }
    
//     // TODO: jsonwebtoken is outdated, please replace with express-jwt or something new and popular one
//     return jwt.verify(token, config.jwt.secret, (err, decoded) => {
//           if (err) {
//             return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
//           }
//           return next();
//     });
// };

// const sendErrorMessageIfErrorExists = (authErrorMessageObject: ErrorMessageObject, res: Response) => {
//     if (hasErrorMessage(authErrorMessageObject)) {
//         return res.status(authErrorMessageObject.httpCode).send({
//             auth: authErrorMessageObject.auth,
//             message: authErrorMessageObject.message    
//         });
//     }
// };

// const router: Router = Router();

// router.get('/verification', 
//     requireAuth, 
//     async (req: Request, res: Response) => {
//         return res.status(200).send({ auth: true, message: 'Authenticated.' });
// });

// router.post('/login', async (req: Request, res: Response) => {
//     try {
//         const {email, password}: {email: string | undefined, password: string | undefined} = req.body
    
//         const user = await User.findByPk(email);
//         const authValid = await comparePasswords(password, user?.password_hash);

//         const authErrorMessageObject = getUserLoginHttpCodeAndErrorMessage(email, password, user, authValid);

//         // sendErrorMessageIfErrorExists(authErrorMessageObject, res);

//         if (hasErrorMessage(authErrorMessageObject)) {
//             return res.status(authErrorMessageObject.httpCode).send({
//                 auth: authErrorMessageObject.auth,
//                 message: authErrorMessageObject.message    
//             });
//         }

//         // // Generate JWT
//         const jwt = generateJWT(user);

//         res.status(200).send({ auth: true, token: jwt, user: user.short()});
//         // res.status(200).send({message: "test"});
//     } catch (e) {
//         console.log(e);
//         res.status(500).send({error: e});
//     }
// });

// //register a new user
// router.post('/', async (req: Request, res: Response) => {

//     try {
//         const {email, plainTextPassword}: {email: string | undefined, plainTextPassword: string | undefined} = req.body;

//         const user = await User.findByPk(email);
//         const authErrorMessageObject = getUserCreatingHttpCodeAndErrorMessage(email, plainTextPassword, user);

//         // sendErrorMessageIfErrorExists(authErrorMessageObject, res);

//         if (hasErrorMessage(authErrorMessageObject)) {
//             return res.status(authErrorMessageObject.httpCode).send({
//                 auth: authErrorMessageObject.auth,
//                 message: authErrorMessageObject.message    
//             });
//         }

//         const password_hash = await generatePassword(plainTextPassword);

//         const newUser = await User.create({
//             email: email,
//             password_hash: password_hash
//         });

//         let savedUser = newUser;
    
//         savedUser = await newUser.save();

//         // Generate JWT
//         const jwt = generateJWT(savedUser);

//         return res.status(201).send({token: jwt, user: savedUser.short()});
    
//     } catch (e: any) {
//         console.log(e?.message);
//         return res.status(500).send({error: e});
//     }
// });

// router.get('/', async (req: Request, res: Response) => {
//     res.send('auth')
// });

// export const AuthRouter: Router = router;