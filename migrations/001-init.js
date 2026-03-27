export const up = async (db) => {
  await db.createCollection("users")
  await db.createCollection("products")
  await db.createCollection("orders")
}

export const down = async (db) => {
  await db.collection("users").drop()
  await db.collection("products").drop()
  await db.collection("orders").drop()
}