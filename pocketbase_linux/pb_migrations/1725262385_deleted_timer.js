/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("ho6harc2a7oeycc");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "ho6harc2a7oeycc",
    "created": "2024-08-24 10:00:54.645Z",
    "updated": "2024-08-24 10:11:59.586Z",
    "name": "timer",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "gheekrck",
        "name": "contestant",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "wwukkqal",
        "name": "timer",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "-1",
            "5",
            "10",
            "15",
            "30"
          ]
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
})
