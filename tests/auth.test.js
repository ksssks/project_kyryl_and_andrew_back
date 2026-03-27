import jwt from 'jsonwebtoken';
import authUser from '../middleware/auth.js';
import httpMocks from 'node-mocks-http';

describe('authUser Middleware', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return error if token is missing', async () => {
        const req = httpMocks.createRequest({
            headers: {},
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await authUser(req, res, next);

        expect(res.statusCode).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(false);
        expect(data.message).toBe('Not authorized, login again');
        expect(next).not.toHaveBeenCalled();
    });

    it('should decode token and call next if token is valid', async () => {
        const mockToken = 'validToken';
        const mockDecoded = { id: '12345' };
        jest.spyOn(jwt, 'verify').mockReturnValue(mockDecoded);

        const req = httpMocks.createRequest({
            headers: { token: mockToken },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await authUser(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
        expect(req.body.userId).toBe(mockDecoded.id);
        expect(next).toHaveBeenCalled();
    });

    it('should return error if token is invalid', async () => {
        const mockToken = 'invalidToken';
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            throw new Error('Invalid token');
        });

        const req = httpMocks.createRequest({
            headers: { token: mockToken },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await authUser(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
        expect(res.statusCode).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(false);
        expect(data.message).toBe('Invalid token');
        expect(next).not.toHaveBeenCalled();
    });
});
