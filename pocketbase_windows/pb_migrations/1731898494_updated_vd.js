/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4nx8jqbkxnpql7q")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "mozjmqfg",
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
  const collection = dao.findCollectionByNameOrId("4nx8jqbkxnpql7q")

  // remove
  collection.schema.removeField("mozjmqfg")

  return dao.saveCollection(collection)
})
