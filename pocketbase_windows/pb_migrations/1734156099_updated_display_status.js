/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("q4s846hvm00rq4p")

  // remove
  collection.schema.removeField("p2m8mtjr")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "cir9e6f9",
    "name": "mediaToPlay",
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
  const collection = dao.findCollectionByNameOrId("q4s846hvm00rq4p")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "p2m8mtjr",
    "name": "playMedia",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  // remove
  collection.schema.removeField("cir9e6f9")

  return dao.saveCollection(collection)
})
