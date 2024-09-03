/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r9czifbr30souwa")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nqv9dnnb",
    "name": "field",
    "type": "editor",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "convertUrls": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r9czifbr30souwa")

  // remove
  collection.schema.removeField("nqv9dnnb")

  return dao.saveCollection(collection)
})
