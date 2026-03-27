import jwt from 'jsonwebtoken';
import adminAuth from '../middleware/adminAUth.js';
import httpMocks from 'node-mocks-http';

describe('adminAuth Middleware', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return error if no token is provided', async () => {
        const req = httpMocks.createRequest({
            headers: {},
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await adminAuth(req, res, next);

        expect(res._getJSONData()).toEqual({
            success: false,
            message: 'Not authorized',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return error if token is invalid', async () => {
        const req = httpMocks.createRequest({
            headers: {
                token: 'invalid-token',
            },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            throw new Error('Invalid token');
        });

        await adminAuth(req, res, next);

        expect(res._getJSONData()).toEqual({
            success: false,
            message: 'Invalid token',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return error if decoded token does not match admin credentials', async () => {
        const req = httpMocks.createRequest({
            headers: {
                token: 'valid-token',
            },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        jest.spyOn(jwt, 'verify').mockReturnValue('wrong-data');

        await adminAuth(req, res, next);

        expect(res._getJSONData()).toEqual({
            success: false,
            message: 'Not authorized',
        });
        expect(next).not.toHaveBeenCalled();
    });
});