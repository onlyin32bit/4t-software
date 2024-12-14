/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("jb3ye0yy8ing399")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ubp3ankq",
    "name": "star",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("jb3ye0yy8ing399")

  // remove
  collection.schema.removeField("ubp3ankq")

  return dao.saveCollection(collection)
})
