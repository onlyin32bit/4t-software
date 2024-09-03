/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "pyym7yntfrtumfh",
    "created": "2024-08-29 12:49:47.492Z",
    "updated": "2024-08-29 12:49:47.492Z",
    "name": "ques_vcnv",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "psskmoau",
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
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pyym7yntfrtumfh");

  return dao.deleteCollection(collection);
})
