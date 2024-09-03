/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "q4s846hvm00rq4p",
    "created": "2024-08-31 13:41:29.641Z",
    "updated": "2024-08-31 13:41:29.641Z",
    "name": "display_status",
    "type": "base",
    "system": false,
    "schema": [
      {
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
      },
      {
        "system": false,
        "id": "jowmu7or",
        "name": "value",
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
  const collection = dao.findCollectionByNameOrId("q4s846hvm00rq4p");

  return dao.deleteCollection(collection);
})
