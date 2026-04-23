import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';

describe('HTTP server', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  it('should response 404 when request unregistered route', async () => {
    const app = await createServer({});
    const response = await request(app).get('/unregisteredRoute');
    expect(response.status).toEqual(404);
  });

  describe('when POST /users', () => {
    it('should response 201 and persisted user', async () => {
      const requestPayload = { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' };
      const app = await createServer(container);
      const response = await request(app).post('/users').send(requestPayload);
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedUser).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = { fullname: 'Dicoding Indonesia', password: 'secret' };
      const app = await createServer(container);
      const response = await request(app).post('/users').send(requestPayload);
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = { username: 'dicoding', password: 'secret', fullname: ['Dicoding Indonesia'] };
      const app = await createServer(container);
      const response = await request(app).post('/users').send(requestPayload);
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena tipe data tidak sesuai');
    });

    it('should response 400 when username more than 50 character', async () => {
      const requestPayload = { username: 'dicodingindonesiadicodingindonesiadicodingindonesiadicoding', password: 'secret', fullname: 'Dicoding Indonesia' };
      const app = await createServer(container);
      const response = await request(app).post('/users').send(requestPayload);
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena karakter username melebihi batas limit');
    });

    it('should response 400 when username contain restricted character', async () => {
      const requestPayload = { username: 'dicoding indonesia', password: 'secret', fullname: 'Dicoding Indonesia' };
      const app = await createServer(container);
      const response = await request(app).post('/users').send(requestPayload);
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena username mengandung karakter terlarang');
    });

    it('should response 400 when username unavailable', async () => {
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      const requestPayload = { username: 'dicoding', fullname: 'Dicoding Indonesia', password: 'super_secret' };
      const app = await createServer(container);
      const response = await request(app).post('/users').send(requestPayload);
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('username tidak tersedia');
    });
  });

  describe('when POST /authentications', () => {
    it('should response 201 and new authentication', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      const response = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should response 400 if username not found', async () => {
      const app = await createServer(container);
      const response = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('username tidak ditemukan');
    });

    it('should response 401 if password wrong', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      const response = await request(app).post('/authentications').send({ username: 'dicoding', password: 'wrong_password' });
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('kredensial yang Anda masukkan salah');
    });

    it('should response 400 if login payload not contain needed property', async () => {
      const app = await createServer(container);
      const response = await request(app).post('/authentications').send({ username: 'dicoding' });
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('harus mengirimkan username dan password');
    });

    it('should response 400 if login payload wrong data type', async () => {
      const app = await createServer(container);
      const response = await request(app).post('/authentications').send({ username: 123, password: 'secret' });
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('username dan password harus string');
    });
  });

  describe('when PUT /authentications', () => {
    it('should return 200 and new access token', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      const loginResponse = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const { refreshToken } = loginResponse.body.data;
      const response = await request(app).put('/authentications').send({ refreshToken });
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return 400 payload not contain refresh token', async () => {
      const app = await createServer(container);
      const response = await request(app).put('/authentications').send({});
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('harus mengirimkan token refresh');
    });

    it('should return 400 if refresh token not string', async () => {
      const app = await createServer(container);
      const response = await request(app).put('/authentications').send({ refreshToken: 123 });
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token harus string');
    });

    it('should return 400 if refresh token not valid', async () => {
      const app = await createServer(container);
      const response = await request(app).put('/authentications').send({ refreshToken: 'invalid_refresh_token' });
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token tidak valid');
    });

    it('should return 400 if refresh token not registered in database', async () => {
      const app = await createServer(container);
      const refreshToken = await container.getInstance(AuthenticationTokenManager.name).createRefreshToken({ username: 'dicoding' });
      const response = await request(app).put('/authentications').send({ refreshToken });
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token tidak ditemukan di database');
    });
  });

  describe('when DELETE /authentications', () => {
    it('should response 200 if refresh token valid', async () => {
      const app = await createServer(container);
      const refreshToken = 'refresh_token';
      await AuthenticationsTableTestHelper.addToken(refreshToken);
      const response = await request(app).delete('/authentications').send({ refreshToken });
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 400 if refresh token not registered in database', async () => {
      const app = await createServer(container);
      const response = await request(app).delete('/authentications').send({ refreshToken: 'refresh_token' });
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('refresh token tidak ditemukan di database');
    });

    it('should response 400 if payload not contain refresh token', async () => {
      const app = await createServer(container);
      const response = await request(app).delete('/authentications').send({});
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('harus mengirimkan token refresh');
    });
  });

  it('should handle server error correctly', async () => {
    const app = await createServer({});
    const response = await request(app).post('/users').send({ username: 'dicoding', fullname: 'Dicoding Indonesia', password: 'super_secret' });
    expect(response.status).toEqual(500);
    expect(response.body.status).toEqual('error');
    expect(response.body.message).toEqual('terjadi kegagalan pada server kami');
  });

  // ============================================================
  // Thread Functional Tests
  // ============================================================
  describe('when POST /threads', () => {
    it('should response 201 and return addedThread', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding' });
      const loginRes = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const { accessToken } = loginRes.body.data;

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'isi thread' });

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread).toBeDefined();
      expect(response.body.data.addedThread.id).toBeDefined();
      expect(response.body.data.addedThread.title).toEqual('sebuah thread');
      expect(response.body.data.addedThread.owner).toBeDefined();
    });

    it('should response 401 if no access token', async () => {
      const app = await createServer(container);
      const response = await request(app).post('/threads').send({ title: 'sebuah thread', body: 'isi thread' });
      expect(response.status).toEqual(401);
    });

    it('should response 400 if payload missing property', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding' });
      const loginRes = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const { accessToken } = loginRes.body.data;

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread' });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
    });
  });

  describe('when GET /threads/:threadId', () => {
    it('should response 200 and return thread detail with comments and replies', async () => {
      const app = await createServer(container);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

      const response = await request(app).get('/threads/thread-123');

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.thread).toBeDefined();
      expect(response.body.data.thread.id).toEqual('thread-123');
      expect(response.body.data.thread.comments).toHaveLength(1);
      expect(response.body.data.thread.comments[0].replies).toHaveLength(1);
    });

    it('should response 404 if thread not found', async () => {
      const app = await createServer(container);
      const response = await request(app).get('/threads/thread-not-exist');
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });
  });

  // ============================================================
  // Comment Functional Tests
  // ============================================================
  describe('when POST /threads/:threadId/comments', () => {
    it('should response 201 and return addedComment', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding' });
      const loginRes = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const { accessToken } = loginRes.body.data;
      const threadRes = await request(app).post('/threads').set('Authorization', `Bearer ${accessToken}`).send({ title: 'a thread', body: 'body' });
      const threadId = threadRes.body.data.addedThread.id;

      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah comment' });

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedComment).toBeDefined();
      expect(response.body.data.addedComment.content).toEqual('sebuah comment');
    });

    it('should response 401 if no access token', async () => {
      const app = await createServer(container);
      const response = await request(app).post('/threads/thread-123/comments').send({ content: 'sebuah comment' });
      expect(response.status).toEqual(401);
    });

    it('should response 404 if thread not found', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding' });
      const loginRes = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const { accessToken } = loginRes.body.data;

      const response = await request(app)
        .post('/threads/thread-not-exist/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah comment' });

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });

    it('should response 400 if payload missing content', async () => {
      const app = await createServer(container);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await request(app).post('/users').send({ username: 'dicoding2', password: 'secret', fullname: 'Dicoding2' });
      const loginRes = await request(app).post('/authentications').send({ username: 'dicoding2', password: 'secret' });
      const { accessToken } = loginRes.body.data;

      const response = await request(app)
        .post('/threads/thread-123/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
    });
  });

  describe('when DELETE /threads/:threadId/comments/:commentId', () => {
    it('should response 200 if comment deleted successfully', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'testuser', password: 'secret', fullname: 'Test' });
      const loginRes = await request(app).post('/authentications').send({ username: 'testuser', password: 'secret' });
      const { accessToken } = loginRes.body.data;
      const userId = (await pool.query("SELECT id FROM users WHERE username='testuser'")).rows[0].id;
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });

      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 403 if not comment owner', async () => {
      const app = await createServer(container);
      await UsersTableTestHelper.addUser({ id: 'user-owner', username: 'owner' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-owner' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-owner' });
      await request(app).post('/users').send({ username: 'otherx', password: 'secret', fullname: 'Other' });
      const loginRes = await request(app).post('/authentications').send({ username: 'otherx', password: 'secret' });
      const { accessToken } = loginRes.body.data;

      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
    });

    it('should response 404 if comment not found', async () => {
      const app = await createServer(container);
      // Register user via API so password is properly hashed
      await request(app).post('/users').send({ username: 'usercomment404', password: 'secret', fullname: 'User' });
      const loginRes = await request(app).post('/authentications').send({ username: 'usercomment404', password: 'secret' });
      const { accessToken } = loginRes.body.data;
      const userId = (await pool.query("SELECT id FROM users WHERE username='usercomment404'")).rows[0].id;
      await ThreadsTableTestHelper.addThread({ id: 'thread-comment404', owner: userId });

      const response = await request(app)
        .delete('/threads/thread-comment404/comments/comment-not-exist')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });
  });

  // ============================================================
  // Reply Functional Tests
  // ============================================================
  describe('when POST /threads/:threadId/comments/:commentId/replies', () => {
    it('should response 201 and return addedReply', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'replyadd201', password: 'secret', fullname: 'Reply User' });
      const loginRes = await request(app).post('/authentications').send({ username: 'replyadd201', password: 'secret' });
      const { accessToken } = loginRes.body.data;
      const userId = (await pool.query("SELECT id FROM users WHERE username='replyadd201'")).rows[0].id;
      await ThreadsTableTestHelper.addThread({ id: 'thread-reply201', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-reply201', threadId: 'thread-reply201', owner: userId });

      const response = await request(app)
        .post('/threads/thread-reply201/comments/comment-reply201/replies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedReply).toBeDefined();
      expect(response.body.data.addedReply.content).toEqual('sebuah balasan');
    });

    it('should response 401 if no access token', async () => {
      const app = await createServer(container);
      const response = await request(app).post('/threads/thread-123/comments/comment-123/replies').send({ content: 'balasan' });
      expect(response.status).toEqual(401);
    });

    it('should response 404 if thread not found', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'dicoding', password: 'secret', fullname: 'Dicoding' });
      const loginRes = await request(app).post('/authentications').send({ username: 'dicoding', password: 'secret' });
      const { accessToken } = loginRes.body.data;

      const response = await request(app)
        .post('/threads/thread-not-exist/comments/comment-123/replies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });

    it('should response 400 if payload missing content', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'reply400user', password: 'secret', fullname: 'Reply 400' });
      const loginRes = await request(app).post('/authentications').send({ username: 'reply400user', password: 'secret' });
      const { accessToken } = loginRes.body.data;
      const userId = (await pool.query("SELECT id FROM users WHERE username='reply400user'")).rows[0].id;
      await ThreadsTableTestHelper.addThread({ id: 'thread-reply400', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-reply400', threadId: 'thread-reply400', owner: userId });

      const response = await request(app)
        .post('/threads/thread-reply400/comments/comment-reply400/replies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
    });
  });

  describe('when DELETE /threads/:threadId/comments/:commentId/replies/:replyId', () => {
    it('should response 200 if reply deleted successfully', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'replyuser', password: 'secret', fullname: 'Reply User' });
      const loginRes = await request(app).post('/authentications').send({ username: 'replyuser', password: 'secret' });
      const { accessToken } = loginRes.body.data;
      const userId = (await pool.query("SELECT id FROM users WHERE username='replyuser'")).rows[0].id;
      await ThreadsTableTestHelper.addThread({ id: 'thread-r1', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-r1', threadId: 'thread-r1', owner: userId });
      await RepliesTableTestHelper.addReply({ id: 'reply-r1', commentId: 'comment-r1', owner: userId });

      const response = await request(app)
        .delete('/threads/thread-r1/comments/comment-r1/replies/reply-r1')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 403 if not reply owner', async () => {
      const app = await createServer(container);
      await UsersTableTestHelper.addUser({ id: 'user-owner', username: 'replyowner' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-owner' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-owner' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-owner' });
      await request(app).post('/users').send({ username: 'otherreply', password: 'secret', fullname: 'Other' });
      const loginRes = await request(app).post('/authentications').send({ username: 'otherreply', password: 'secret' });
      const { accessToken } = loginRes.body.data;

      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
    });

    it('should response 404 if reply not found', async () => {
      const app = await createServer(container);
      await request(app).post('/users').send({ username: 'reply404user', password: 'secret', fullname: 'Reply 404' });
      const loginRes = await request(app).post('/authentications').send({ username: 'reply404user', password: 'secret' });
      const { accessToken } = loginRes.body.data;
      const userId = (await pool.query("SELECT id FROM users WHERE username='reply404user'")).rows[0].id;
      await ThreadsTableTestHelper.addThread({ id: 'thread-reply404', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-reply404', threadId: 'thread-reply404', owner: userId });

      const response = await request(app)
        .delete('/threads/thread-reply404/comments/comment-reply404/replies/reply-not-exist')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });
  });
});
