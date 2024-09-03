/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r9czifbr30souwa")

  // remove
  collection.schema.removeField("vxiubjmf")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r9czifbr30souwa")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vxiubjmf",
    "name": "log",
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
