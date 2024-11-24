/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("q3o72695gakc2vi")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "np2rpq5l",
    "name": "start",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("q3o72695gakc2vi")

  // remove
  collection.schema.removeField("np2rpq5l")

  return dao.saveCollection(collection)
})
