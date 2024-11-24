/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("q3o72695gakc2vi")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qidtdvu2",
    "name": "h1",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "xfb1fbbm",
    "name": "h2",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "xuknyklq",
    "name": "h3",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qjpbwi7i",
    "name": "h4",
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

  // remove
  collection.schema.removeField("qidtdvu2")

  // remove
  collection.schema.removeField("xfb1fbbm")

  // remove
  collection.schema.removeField("xuknyklq")

  // remove
  collection.schema.removeField("qjpbwi7i")

  return dao.saveCollection(collection)
})
