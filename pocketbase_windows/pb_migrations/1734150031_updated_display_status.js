/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("q4s846hvm00rq4p")

  // remove
  collection.schema.removeField("vgikpc5y")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("q4s846hvm00rq4p")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vgikpc5y",
    "name": "sound",
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
})
