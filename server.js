import 'dotenv/config'
import app from './app.js'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import logger from './config/logger.js'
import { exec } from "child_process"
import mongoose from "mongoose"

const port = process.env.PORT || 4000

let server

const startServer = async () => {
  try {
    await connectDB()
    await connectCloudinary()
    logger.info("Cloudinary connected");

    await new Promise((resolve, reject) => {
      exec("npx migrate-mongo up", (err) => {
        if (err) return reject(err)
        logger.info("Migrations applied")
        resolve()
      })
    })

    server = app.listen(port, () => {
      logger.info(`Server started on port: ${port}`)
    })

  } catch (err) {
    logger.error("Startup failed", err)
    process.exit(1)
  }
}

startServer()

// graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`)

  try {
    await new Promise((resolve) => {
      if (server) {
        server.close(() => {
          logger.info("HTTP server closed")
          resolve()
        })
      } else resolve()
    })

    await mongoose.connection.close()
    logger.info("DB connection closed")

    if (signal !== "SIGUSR2") {
      process.exit(0)
    }

  } catch (err) {
    logger.error({ message: "Error during shutdown", err })
    process.exit(1)
  }
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)
process.on("SIGUSR2", async () => {
  await shutdown("SIGUSR2")
  process.kill(process.pid, "SIGUSR2")
})