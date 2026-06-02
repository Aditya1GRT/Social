const path = require('path');
const fs   = require('fs');

// ── Mongoose adapter (used when MONGODB_URI is set) ───────────────────────────
//
// Exposes the same async API as NeDB datastores so every route file works
// identically regardless of which backend is active.
class MongooseAdapter {
  constructor(Model) { this.Model = Model; }

  // NeDB uses { arr: { $elemMatch: scalar } } to mean "arr contains scalar".
  // MongoDB's $elemMatch requires a query object, not a scalar.
  // Both support the simpler { arr: scalar } form for array membership tests.
  _q(query) {
    if (!query || typeof query !== 'object' || Array.isArray(query)) return query;
    const out = {};
    for (const [k, v] of Object.entries(query)) {
      if (v && typeof v === 'object' && !Array.isArray(v) &&
          '$elemMatch' in v && typeof v.$elemMatch !== 'object') {
        out[k] = v.$elemMatch;
      } else if (v && typeof v === 'object' && !Array.isArray(v)) {
        out[k] = this._q(v);
      } else {
        out[k] = v;
      }
    }
    return out;
  }

  _norm(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    return { ...obj, _id: obj._id.toString() };
  }

  async findOneAsync(query) {
    return this._norm(await this.Model.findOne(this._q(query)).lean());
  }

  async findAsync(query) {
    const docs = await this.Model.find(this._q(query)).lean();
    return docs.map(d => this._norm(d));
  }

  async insertAsync(doc) {
    return this._norm(await this.Model.create(doc));
  }

  async updateAsync(query, update) {
    await this.Model.updateOne(this._q(query), update);
    return { numReplaced: 1 };
  }

  async removeAsync(query, opts) {
    if (opts && opts.multi) await this.Model.deleteMany(this._q(query));
    else                    await this.Model.deleteOne(this._q(query));
    return { numRemoved: 1 };
  }

  async ensureIndexAsync() {} // handled by Mongoose schema indexes
}

// ── Pick backend based on env ─────────────────────────────────────────────────

if (process.env.MONGODB_URI) {
  const User         = require('./models/User');
  const Post         = require('./models/Post');
  const Conversation = require('./models/Conversation');
  const Message      = require('./models/Message');

  module.exports = {
    users:         new MongooseAdapter(User),
    posts:         new MongooseAdapter(Post),
    conversations: new MongooseAdapter(Conversation),
    messages:      new MongooseAdapter(Message),
    usingMongo: true,
  };
} else {
  // ── NeDB fallback (local dev — data is lost on process restart) ─────────────
  const Datastore = require('@seald-io/nedb');

  const dbDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  const users         = new Datastore({ filename: path.join(dbDir, 'users.db'),         autoload: true });
  const posts         = new Datastore({ filename: path.join(dbDir, 'posts.db'),         autoload: true });
  const conversations = new Datastore({ filename: path.join(dbDir, 'conversations.db'), autoload: true });
  const messages      = new Datastore({ filename: path.join(dbDir, 'messages.db'),      autoload: true });

  users.ensureIndexAsync({ fieldName: 'username', unique: true }).catch(console.error);
  users.ensureIndexAsync({ fieldName: 'email',    unique: true }).catch(console.error);

  module.exports = { users, posts, conversations, messages, usingMongo: false };
}
