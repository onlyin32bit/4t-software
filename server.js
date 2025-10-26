import express from 'express';
import { createServer } from 'http';
import { attachSocket } from './socket-io.js'
import { handler } from './build/handler.js';

const port = 3001;
const app = express();
const server = createServer(app);

attachSocket(server);

// Express middleware
// https://github.com/sveltejs/kit/tree/master/packages/adapter-node#custom-server
app.use(handler);

server.listen(port);