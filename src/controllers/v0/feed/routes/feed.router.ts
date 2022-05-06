import { Router, Request, Response, NextFunction } from 'express';
import { FeedItem } from '../models/FeedItem';
import * as AWS from '../../../../aws';
import jwt from 'jsonwebtoken';
import { config } from '../../../../config/config';

const c = config.dev;

const captionError = {
    httpCode: 400,
    message: 'Caption is required or malformed' 
};

const urlError = {
    httpCode: 400,
    message: 'File url is required'
};

const getError = (caption: string | undefined, fileName: string | undefined) => {
    if (!caption) {
        return captionError;
    }

    if (!fileName) {
        return urlError;
    }
};

const hasValidAuthorizationHeader = (req: Request): boolean => {
    const { authorization } = req.headers
        
    return authorization !== undefined;
};

const getTokenFromTokenBearer = (tokenFromHeader: string): string | null => {
    const token_bearer = tokenFromHeader.split(' ');
        
    if (token_bearer.length != 2) {
        return null;
    }
        
    return token_bearer[1];
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    console.warn("auth.router not yet implemented, you'll cover this in lesson 5")
    
    if (!hasValidAuthorizationHeader(req)) {
        return res.status(401).send({ message: 'No authorization headers.' });
    }
        
    const token = getTokenFromTokenBearer(req.headers.authorization);
        
    if (!token) {
        return res.status(401).send({ message: 'Malformed token.' });
    }
    
    // TODO: jsonwebtoken is outdated, please replace with express-jwt or something new and popular one
    return jwt.verify(token, config.jwt.secret, (err, decoded) => {
          if (err) {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
          }
          return next();
    });
};

const router: Router = Router();

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});
    items.rows.map((item) => {
            if(item.url) {
                item.url = AWS.getGetSignedUrl(item.url);
            }
    });
    res.send(items);
});

// update a specific resource
router.patch('/:id', 
    requireAuth, 
    async (req: Request, res: Response) => {
        const {caption, fileName} = req.body;

        const errorMessageObject = getError(caption, fileName);
        if (errorMessageObject) {
            return res.status(errorMessageObject.httpCode).send({message: errorMessageObject.message});
        }

        const item = await FeedItem.findByPk(req.params.id);
        if (!item) {
            return res.status(404).send("File Not Found");
        }

        item.caption = caption;
        item.url = fileName;
        const savedItem = await item.save();

        res.status(200).send({url: savedItem.url, caption: savedItem.url});
});

// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName', 
    requireAuth, 
    async (req: Request, res: Response) => {
        const { fileName } = req.params;
        const url = AWS.getPutSignedUrl(fileName);
        res.status(201).send({url: url});
});

router.get('/:fileName', 
    requireAuth, 
    async (req: Request, res: Response) => {
        const { fileName } = req.params;
        const url = AWS.getGetSignedUrl(fileName);
        res.status(201).send({url: url});
});

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is the key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/', 
    requireAuth, 
    async (req: Request, res: Response) => {
 
    const {caption, fileName} = req.body;

    const errorMessageObject = getError(caption, fileName);

    if (errorMessageObject) {
        return res.status(errorMessageObject.httpCode).send({message: errorMessageObject.message});
    }

    const item = new FeedItem({
            caption: caption,
            url: fileName
    });

    const saved_item = await item.save();

    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
});

export const FeedRouter: Router = router;