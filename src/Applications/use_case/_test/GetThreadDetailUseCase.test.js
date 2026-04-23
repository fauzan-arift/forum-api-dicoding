import { vi } from 'vitest';
import GetThreadDetailUseCase from '../GetThreadDetailUseCase.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate get thread detail action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const mockThreadFromRepo = {
      id: threadId,
      title: 'sebuah thread',
      body: 'isi thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockCommentsFromRepo = [
      {
        id: 'comment-1',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        // eslint-disable-next-line camelcase
        is_delete: false,
      },
      {
        id: 'comment-2',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'komentar yang dihapus',
        // eslint-disable-next-line camelcase
        is_delete: true,
      },
    ];

    const mockRepliesFromRepo = [
      {
        id: 'reply-1',
        // eslint-disable-next-line camelcase
        comment_id: 'comment-1',
        username: 'johndoe',
        date: '2021-08-08T08:00:00.000Z',
        content: 'sebuah balasan',
        // eslint-disable-next-line camelcase
        is_delete: false,
      },
      {
        id: 'reply-2',
        // eslint-disable-next-line camelcase
        comment_id: 'comment-1',
        username: 'dicoding',
        date: '2021-08-08T08:05:00.000Z',
        content: 'balasan terhapus',
        // eslint-disable-next-line camelcase
        is_delete: true,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = vi.fn().mockResolvedValue(mockThreadFromRepo);
    mockCommentRepository.getCommentsByThreadId = vi.fn().mockResolvedValue(mockCommentsFromRepo);
    mockReplyRepository.getRepliesByCommentIds = vi.fn().mockResolvedValue(mockRepliesFromRepo);

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail).toStrictEqual({
      id: threadId,
      title: 'sebuah thread',
      body: 'isi thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-1',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          replies: [
            {
              id: 'reply-1',
              content: 'sebuah balasan',
              date: '2021-08-08T08:00:00.000Z',
              username: 'johndoe',
            },
            {
              id: 'reply-2',
              content: '**balasan telah dihapus**',
              date: '2021-08-08T08:05:00.000Z',
              username: 'dicoding',
            },
          ],
          content: 'sebuah comment',
        },
        {
          id: 'comment-2',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          replies: [],
          content: '**komentar telah dihapus**',
        },
      ],
    });

    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledWith(['comment-1', 'comment-2']);
  });
});
