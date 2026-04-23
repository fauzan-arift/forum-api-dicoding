import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';
import CreatedReply from '../../../Domains/replies/entities/CreatedReply.js';
import CreateReply from '../../../Domains/replies/entities/CreateReply.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply', () => {
    it('should persist reply and return created reply correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const createReply = new CreateReply({ content: 'sebuah balasan', commentId: 'comment-123', owner: 'user-123' });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await replyRepositoryPostgres.addReply(createReply);

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should return CreatedReply correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const createReply = new CreateReply({ content: 'sebuah balasan', commentId: 'comment-123', owner: 'user-123' });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const createdReply = await replyRepositoryPostgres.addReply(createReply);

      expect(createdReply).toStrictEqual(new CreatedReply({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyReplyExists', () => {
    it('should throw NotFoundError when reply does not exist', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(replyRepositoryPostgres.verifyReplyExists('reply-not-exist'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw error when reply exists', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(replyRepositoryPostgres.verifyReplyExists('reply-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner', () => {
    it('should throw AuthorizationError when owner does not match', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-other'))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw error when owner matches', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReply', () => {
    it('should soft delete reply correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');

      await replyRepositoryPostgres.deleteReply('reply-123');

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies[0].is_delete).toBe(true);
    });
  });

  describe('getRepliesByCommentIds', () => {
    it('should return empty array when no comment ids', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds([]);
      expect(replies).toStrictEqual([]);
    });

    it('should return replies ordered by date ASC', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-1', commentId: 'comment-123', owner: 'user-123', content: 'balasan 1', date: '2021-08-08T07:00:00.000Z' });
      await RepliesTableTestHelper.addReply({ id: 'reply-2', commentId: 'comment-123', owner: 'user-123', content: 'balasan 2', date: '2021-08-08T08:00:00.000Z' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');

      const replies = await replyRepositoryPostgres.getRepliesByCommentIds(['comment-123']);

      expect(replies).toStrictEqual([
        {
          id: 'reply-1',
          // eslint-disable-next-line camelcase
          comment_id: 'comment-123',
          username: 'dicoding',
          date: expect.any(String),
          content: 'balasan 1',
          // eslint-disable-next-line camelcase
          is_delete: false,
        },
        {
          id: 'reply-2',
          // eslint-disable-next-line camelcase
          comment_id: 'comment-123',
          username: 'dicoding',
          date: expect.any(String),
          content: 'balasan 2',
          // eslint-disable-next-line camelcase
          is_delete: false,
        },
      ]);
      expect(replies[0].date < replies[1].date).toBe(true);
    });
  });
});
