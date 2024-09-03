/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2p3nbmhjzs4rcea")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "euyfpgmm",
    "name": "question",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2000000
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "2ib6s5mr",
    "name": "files",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [],
      "thumbs": [],
      "maxSelect": 99,
      "maxSize": 5242880,
      "protected": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2p3nbmhjzs4rcea")

  // remove
  collection.schema.removeField("euyfpgmm")

  // remove
  collection.schema.removeField("2ib6s5mr")

  return dao.saveCollection(collection)
})
