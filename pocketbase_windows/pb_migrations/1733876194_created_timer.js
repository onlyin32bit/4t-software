/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "99y8w6hfmyivmnt",
    "created": "2024-12-11 00:16:34.371Z",
    "updated": "2024-12-11 00:16:34.371Z",
    "name": "timer",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "jv5rafqe",
        "name": "time",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
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
  const collection = dao.findCollectionByNameOrId("99y8w6hfmyivmnt");

  return dao.deleteCollection(collection);
})
