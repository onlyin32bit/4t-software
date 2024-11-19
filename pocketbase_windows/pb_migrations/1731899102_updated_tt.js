/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2p3nbmhjzs4rcea")

  // remove
  collection.schema.removeField("qrusixji")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jwx7qvhs",
    "name": "files",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [],
      "thumbs": [],
      "maxSelect": 99,
      "maxSize": 100000000,
      "protected": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2p3nbmhjzs4rcea")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qrusixji",
    "name": "state",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2000000
    }
  }))

  // remove
  collection.schema.removeField("jwx7qvhs")

  return dao.saveCollection(collection)
})
