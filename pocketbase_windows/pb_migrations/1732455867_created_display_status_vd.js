/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "jb3ye0yy8ing399",
    "created": "2024-11-24 13:44:27.192Z",
    "updated": "2024-11-24 13:44:27.192Z",
    "name": "display_status_vd",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "dikgmusl",
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
  const collection = dao.findCollectionByNameOrId("jb3ye0yy8ing399");

  return dao.deleteCollection(collection);
})
