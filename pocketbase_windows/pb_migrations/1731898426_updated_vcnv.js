/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pyym7yntfrtumfh")

  // remove
  collection.schema.removeField("kxqpi8nt")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "k4nf58qs",
    "name": "file",
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
  const collection = dao.findCollectionByNameOrId("pyym7yntfrtumfh")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "kxqpi8nt",
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
  collection.schema.removeField("k4nf58qs")

  return dao.saveCollection(collection)
})
