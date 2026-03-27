process.env.NODE_ENV = "test"

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn()
    }
  }))
})

import request from 'supertest'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import app from '../app.js'
import userModel from '../models/userModel.js'

jest.mock('../models/userModel.js')
jest.mock('bcrypt')
jest.mock('jsonwebtoken')

jest.spyOn(mongoose, 'connection', 'get').mockReturnValue({
  db: {
    admin: () => ({
      ping: jest.fn().mockResolvedValue(true)
    })
  },
  close: jest.fn()
})

describe('User Registration', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return success when a new user is registered', async () => {
    const mockReqBody = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'strongpassword123',
    }

    userModel.findOne.mockResolvedValue(null)
    bcrypt.genSalt.mockResolvedValue('somesalt')
    bcrypt.hash.mockResolvedValue('hashedpassword')

    userModel.prototype.save = jest.fn().mockResolvedValue({
      _id: 'mockUserId',
      ...mockReqBody,
      password: 'hashedpassword',
    })

    jwt.sign.mockReturnValue('mockJwtToken')

    const res = await request(app)
      .post('/api/user/register')
      .send(mockReqBody)

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.token).toBe('mockJwtToken')
  })

  it('should return an error if the user already exists', async () => {
    userModel.findOne.mockResolvedValue({ email: 'john@example.com' })

    const res = await request(app)
      .post('/api/user/register')
      .send({
        name: 'John',
        email: 'john@example.com',
        password: '12345678',
      })

    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('User already exists')
  })

  it('should return invalid email error', async () => {
    userModel.findOne.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/user/register')
      .send({
        name: 'John',
        email: 'invalid',
        password: '12345678',
      })

    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Please enter a valid email')
  })

  it('should return weak password error', async () => {
    userModel.findOne.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/user/register')
      .send({
        name: 'John',
        email: 'john@mail.com',
        password: '123',
      })

    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Please enter a strong password')
  })

  it('should handle DB error', async () => {
    userModel.findOne.mockRejectedValue(new Error('Database error'))

    const res = await request(app)
      .post('/api/user/register')
      .send({
        name: 'John',
        email: 'john@mail.com',
        password: '12345678',
      })

    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Database error')
  })
})

describe('User Login', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should login successfully', async () => {
    userModel.findOne.mockResolvedValue({
      _id: 'id',
      email: 'john@mail.com',
      password: 'hashed',
    })

    bcrypt.compare.mockResolvedValue(true)
    jwt.sign.mockReturnValue('token')

    const res = await request(app)
      .post('/api/user/login')
      .send({
        email: 'john@mail.com',
        password: '12345678',
      })

    expect(res.body.success).toBe(true)
    expect(res.body.token).toBe('token')
  })

  it('should fail if user not found', async () => {
    userModel.findOne.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/user/login')
      .send({
        email: 'no@mail.com',
        password: '123',
      })

    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe("User dosen`t exists")
  })

  it('should fail if password wrong', async () => {
    userModel.findOne.mockResolvedValue({
      password: 'hashed'
    })

    bcrypt.compare.mockResolvedValue(false)

    const res = await request(app)
      .post('/api/user/login')
      .send({
        email: 'john@mail.com',
        password: 'wrong',
      })

    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Invalid credentials')
  })
})

describe('Admin Login', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should login admin', async () => {
    jwt.sign.mockReturnValue('adminToken')

    const res = await request(app)
      .post('/api/user/admin')
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      })

    expect(res.body.success).toBe(true)
    expect(res.body.token).toBe('adminToken')
  })

  it('should fail invalid admin', async () => {
    const res = await request(app)
      .post('/api/user/admin')
      .send({
        email: 'wrong',
        password: 'wrong',
      })

    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('Invalid credentials')
  })
})