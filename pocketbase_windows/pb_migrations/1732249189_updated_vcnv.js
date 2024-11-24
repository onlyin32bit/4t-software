/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pyym7yntfrtumfh")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jw6frjro",
    "name": "image",
    "type": "file",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [
        "image/jpeg",
        "image/png",
        "image/vnd.mozilla.apng",
        "image/webp"
      ],
      "thumbs": [],
      "maxSelect": 1,
      "maxSize": 5242880,
      "protected": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("pyym7yntfrtumfh")

  // remove
  collection.schema.removeField("jw6frjro")

  return dao.saveCollection(collection)
})
