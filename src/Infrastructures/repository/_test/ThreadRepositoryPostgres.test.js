import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';
import CreatedThread from '../../../Domains/threads/entities/CreatedThread.js';
import CreateThread from '../../../Domains/threads/entities/CreateThread.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread', () => {
    it('should persist thread and return created thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const createThread = new CreateThread({ title: 'sebuah thread', body: 'isi thread', owner: 'user-123' });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(createThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return CreatedThread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const createThread = new CreateThread({ title: 'sebuah thread', body: 'isi thread', owner: 'user-123' });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdThread = await threadRepositoryPostgres.addThread(createThread);

      // Assert
      expect(createdThread).toStrictEqual(new CreatedThread({
        id: 'thread-123',
        title: 'sebuah thread',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyThreadExists', () => {
    it('should throw NotFoundError when thread does not exist', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => '123');
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-not-exist'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw error when thread exists', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => '123');
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById', () => {
    it('should throw NotFoundError when thread does not exist', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => '123');
      await expect(threadRepositoryPostgres.getThreadById('thread-not-exist'))
        .rejects.toThrow(NotFoundError);
    });

    it('should return thread detail correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'sebuah thread', body: 'isi thread', owner: 'user-123', date: '2021-08-08T07:19:09.775Z' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => '123');

      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      expect(thread).toStrictEqual({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'isi thread',
        username: 'dicoding',
        date: expect.any(String),
      });
    });
  });
});
