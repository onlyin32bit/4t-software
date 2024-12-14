/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("in93pj9ecq25b1f")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "hjxu57zu",
    "name": "field",
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
  const collection = dao.findCollectionByNameOrId("in93pj9ecq25b1f")

  // remove
  collection.schema.removeField("hjxu57zu")

  return dao.saveCollection(collection)
})
