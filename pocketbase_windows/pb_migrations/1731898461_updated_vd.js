/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4nx8jqbkxnpql7q")

  // remove
  collection.schema.removeField("kadu0bmq")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4nx8jqbkxnpql7q")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "kadu0bmq",
    "name": "contestant",
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
