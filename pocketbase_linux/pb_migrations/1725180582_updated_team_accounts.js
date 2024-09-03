/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("5x8vv7elx14ygqg")

  collection.name = "btc"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("5x8vv7elx14ygqg")

  collection.name = "team_accounts"

  return dao.saveCollection(collection)
})
