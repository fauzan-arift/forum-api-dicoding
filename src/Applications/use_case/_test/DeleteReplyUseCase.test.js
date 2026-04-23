import { vi } from 'vitest';
import DeleteReplyUseCase from '../DeleteReplyUseCase.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply action correctly', async () => {
    // Arrange
    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      owner: 'user-123',
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = vi.fn();
    mockCommentRepository.verifyCommentExists = vi.fn();
    mockReplyRepository.verifyReplyExists = vi.fn();
    mockReplyRepository.verifyReplyOwner = vi.fn();
    mockReplyRepository.deleteReply = vi.fn();

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCaseParam);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(useCaseParam.commentId);
    expect(mockReplyRepository.verifyReplyExists).toBeCalledWith(useCaseParam.replyId);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(useCaseParam.replyId, useCaseParam.owner);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(useCaseParam.replyId);
  });
});
