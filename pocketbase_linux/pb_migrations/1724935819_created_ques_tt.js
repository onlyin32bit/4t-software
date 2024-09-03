/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "2p3nbmhjzs4rcea",
    "created": "2024-08-29 12:50:19.159Z",
    "updated": "2024-08-29 12:50:19.159Z",
    "name": "ques_tt",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "jl9vksaz",
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
  const collection = dao.findCollectionByNameOrId("2p3nbmhjzs4rcea");

  return dao.deleteCollection(collection);
})
