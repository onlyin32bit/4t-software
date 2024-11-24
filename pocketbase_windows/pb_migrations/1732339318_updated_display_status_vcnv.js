/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("q3o72695gakc2vi")

  // remove
  collection.schema.removeField("0myuzlpj")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tslepvcm",
    "name": "center",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("q3o72695gakc2vi")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "0myuzlpj",
    "name": "center",
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

  // remove
  collection.schema.removeField("tslepvcm")

  return dao.saveCollection(collection)
})
