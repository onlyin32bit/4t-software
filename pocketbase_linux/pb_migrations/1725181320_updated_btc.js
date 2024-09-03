/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("5x8vv7elx14ygqg")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qs9vt3tn",
    "name": "name",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("5x8vv7elx14ygqg")

  // remove
  collection.schema.removeField("qs9vt3tn")

  return dao.saveCollection(collection)
})
