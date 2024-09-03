/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "yz8n4yc7quoexwt",
    "created": "2024-08-24 08:35:22.004Z",
    "updated": "2024-08-24 08:35:22.004Z",
    "name": "score",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "vkzhtj7u",
        "name": "username",
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
        "id": "1giusvuv",
        "name": "score",
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
  const collection = dao.findCollectionByNameOrId("yz8n4yc7quoexwt");

  return dao.deleteCollection(collection);
})
