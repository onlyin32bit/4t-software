/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pyym7yntfrtumfh")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "xncurgev",
    "name": "question",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2000000
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pyym7yntfrtumfh")

  // remove
  collection.schema.removeField("xncurgev")

  return dao.saveCollection(collection)
})
