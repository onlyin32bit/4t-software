/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("q4s846hvm00rq4p")

  // remove
  collection.schema.removeField("mzvleuia")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "bih13f9z",
    "name": "action",
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

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "t1ksssik",
    "name": "field",
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
    "id": "mzvleuia",
    "name": "value",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  // remove
  collection.schema.removeField("bih13f9z")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "t1ksssik",
    "name": "action",
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
