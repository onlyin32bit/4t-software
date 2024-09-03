#!/bin/bash

source ../.env

exec ./pocketbase serve --http=$PUBLIC_DB_ADDRESS":8090"
