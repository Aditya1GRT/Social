#!/usr/bin/env node
/* End-to-end smoke test of every core flow, hitting the real Express server. */
const { spawn } = require('child_process');
const http = require('http');

const BASE = 'http://localhost:5055';
const log = (ok, name, extra = '') =>
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -> ' + extra : ''}`);

function req(method, path, body, token) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.token = `Bearer ${token}`;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    const r = http.request(BASE + path, { method, headers }, (res) => {
      let buf = '';
      res.on('data', (c) => (buf += c));
      res.on('end', () => {
        let json;
        try { json = JSON.parse(buf); } catch { json = buf; }
        resolve({ status: res.statusCode, body: json });
      });
    });
    r.on('error', (e) => resolve({ status: 0, body: e.message }));
    if (data) r.write(data);
    r.end();
  });
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    const r = await req('GET', '/api/health');
    if (r.status === 200) return true;
    await wait(250);
  }
  return false;
}

(async () => {
  const server = spawn('node', ['server.js'], {
    cwd: __dirname,
    env: { ...process.env, PORT: '5055' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let serverErr = '';
  server.stderr.on('data', (d) => (serverErr += d));

  const up = await waitForServer();
  if (!up) {
    console.log('SERVER FAILED TO START');
    console.log(serverErr);
    server.kill('SIGKILL');
    process.exit(1);
  }

  const u = 'tester_' + Date.now();
  let token, id, postId, convoId;
  let pass = 0, fail = 0;
  const check = (cond, name, extra) => { cond ? pass++ : fail++; log(cond, name, extra); };

  // 1. signup
  let r = await req('POST', '/api/auth/signup', { username: u, email: u + '@x.com', password: 'pw123456', name: 'Tester' });
  token = r.body.accessToken; id = r.body._id;
  check(r.status === 201 && token && id, 'signup', `status ${r.status}`);

  // 2. login
  r = await req('POST', '/api/auth/login', { username: u, password: 'pw123456' });
  check(r.status === 200 && r.body.accessToken, 'login', `status ${r.status}`);

  // 3. bio update
  r = await req('PUT', `/api/users/${id}`, { description: 'my new bio', _id: id }, token);
  check(r.status === 200 && r.body.description === 'my new bio', 'bio update', `status ${r.status} desc="${r.body.description}"`);

  // 4. bio update WITHOUT token (should fail 401/403)
  r = await req('PUT', `/api/users/${id}`, { description: 'hack' }, null);
  check(r.status === 401 || r.status === 403, 'bio update rejects no-token', `status ${r.status}`);

  // 5. profile photo update
  r = await req('PUT', `/api/users/${id}`, { profilePicture: 'http://example.com/p.png', _id: id }, token);
  check(r.status === 200 && r.body.profilePicture === 'http://example.com/p.png', 'profile photo update', `status ${r.status}`);

  // 6. create post
  r = await req('POST', '/api/posts/create-post', { userId: id, description: 'hello world', postMedia: 'null', mediaType: '' }, token);
  postId = r.body._id;
  check(r.status === 201 && postId, 'create post', `status ${r.status}`);

  // 7. feed
  r = await req('GET', `/api/posts/${id}`);
  check(r.status === 200 && Array.isArray(r.body) && r.body.length >= 1, 'feed returns posts', `count ${Array.isArray(r.body) ? r.body.length : '?'}`);

  // 8. profile posts
  r = await req('GET', `/api/posts/profile/${id}`);
  check(r.status === 200 && Array.isArray(r.body) && r.body.length >= 1, 'profile posts', `count ${Array.isArray(r.body) ? r.body.length : '?'}`);

  // 9. like post
  r = await req('PUT', `/api/posts/reactions/${postId}`, { userId: id }, token);
  check(r.status === 200, 'like post', `status ${r.status}`);

  // 10. comment
  r = await req('PUT', `/api/posts/comment/${postId}`, { commentData: { userId: id, comment: 'nice', username: u } }, token);
  check(r.status === 200, 'comment on post', `status ${r.status}`);

  // 11. second user for social graph
  const u2 = 'tester2_' + Date.now();
  r = await req('POST', '/api/auth/signup', { username: u2, email: u2 + '@x.com', password: 'pw123456', name: 'Tester2' });
  const token2 = r.body.accessToken, id2 = r.body._id;
  check(r.status === 201 && id2, 'second signup', `status ${r.status}`);

  // 12. follow request
  r = await req('PUT', `/api/users/follow-request/${id2}`, { userId: id }, token);
  check(r.status === 200, 'send follow request', `status ${r.status}`);

  // 13. verify request received
  r = await req('GET', `/api/users/user/${u2}`);
  check(r.status === 200 && (r.body.reqRecieved || []).includes(id), 'follow request received', `reqRecieved=${JSON.stringify(r.body.reqRecieved)}`);

  // 14. approve follow request (u2 approves u)
  r = await req('PUT', `/api/users/approve-follow-request/${id}`, { userId: id2 }, token2);
  check(r.status === 200, 'approve follow request', `status ${r.status}`);

  // 15. search users
  r = await req('GET', `/api/users/tester`);
  const searchCount = r.body && typeof r.body === 'object' ? Object.keys(r.body).length : 0;
  check(r.status === 200 && searchCount >= 2, 'search users', `found ${searchCount}`);

  // 16. create conversation
  r = await req('POST', '/api/conversations', { senderId: id, receiverId: id2 }, token);
  convoId = r.body._id;
  check((r.status === 200 || r.status === 201) && convoId, 'create conversation', `status ${r.status}`);

  // 17. send message
  r = await req('POST', '/api/message', { conversationId: convoId, senderId: id, message: 'hi there' }, token);
  check(r.status === 201 && r.body._id, 'send message', `status ${r.status}`);

  // 18. get messages
  r = await req('GET', `/api/message/${convoId}`);
  check(r.status === 200 && Array.isArray(r.body) && r.body.length >= 1, 'get messages', `count ${Array.isArray(r.body) ? r.body.length : '?'}`);

  // 19. get conversations for user
  r = await req('GET', `/api/conversations/${id}`);
  check(r.status === 200 && Array.isArray(r.body) && r.body.length >= 1, 'list conversations', `count ${Array.isArray(r.body) ? r.body.length : '?'}`);

  // 20. followers / following lists
  r = await req('GET', `/api/users/followers/${u2}`);
  check(r.status === 200 && Array.isArray(r.body), 'followers list', `count ${Array.isArray(r.body) ? r.body.length : '?'}`);

  console.log(`\n==== ${pass} passed, ${fail} failed ====`);
  server.kill('SIGKILL');
  process.exit(fail ? 1 : 0);
})();
