/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("5x8vv7elx14ygqg")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "huoq24wn",
    "name": "online",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("5x8vv7elx14ygqg")

  // remove
  collection.schema.removeField("huoq24wn")

  return dao.saveCollection(collection)
})
