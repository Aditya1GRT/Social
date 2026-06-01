const Datastore = require('@seald-io/nedb');
const path = require('path');

const dbDir = path.join(__dirname, 'data');

const users = new Datastore({ filename: path.join(dbDir, 'users.db'), autoload: true });
const posts = new Datastore({ filename: path.join(dbDir, 'posts.db'), autoload: true });
const conversations = new Datastore({ filename: path.join(dbDir, 'conversations.db'), autoload: true });
const messages = new Datastore({ filename: path.join(dbDir, 'messages.db'), autoload: true });

users.ensureIndexAsync({ fieldName: 'username', unique: true }).catch(console.error);
users.ensureIndexAsync({ fieldName: 'email', unique: true }).catch(console.error);

module.exports = { users, posts, conversations, messages };
