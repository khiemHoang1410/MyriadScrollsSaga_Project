// server/src/utils/asyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';

// Dùng Generics P, ResBody, ReqBody, ReqQuery để type linh hoạt hơn
type AsyncExpressFunction<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = Query
> = (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
) => Promise<any>; // Hoặc Promise<void>

export const asyncHandler = <
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = Query
>(
    execution: AsyncExpressFunction<P, ResBody, ReqBody, ReqQuery>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
    return (
        req: Request<P, ResBody, ReqBody, ReqQuery>,
        res: Response<ResBody>,
        next: NextFunction
    ): void => {
        execution(req, res, next).catch(next);
    };
};
