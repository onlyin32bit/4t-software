/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("q3o72695gakc2vi")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tslepvcm",
    "name": "hcenter",
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

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tslepvcm",
    "name": "center",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
})
