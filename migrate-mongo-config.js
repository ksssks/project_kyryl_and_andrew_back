import "dotenv/config";

export default {
  mongodb: {
    url: process.env.MONGODB_URI,
    databaseName: "e-commerce",
    options: {}
  },

  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js"
};