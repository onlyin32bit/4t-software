/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("cd8k42oq4u5mnqz")

  collection.listRule = ""
  collection.updateRule = ""

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("cd8k42oq4u5mnqz")

  collection.listRule = null
  collection.updateRule = null

  return dao.saveCollection(collection)
})
