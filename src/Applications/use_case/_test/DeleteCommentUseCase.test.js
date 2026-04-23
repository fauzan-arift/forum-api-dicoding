import { vi } from 'vitest';
import DeleteCommentUseCase from '../DeleteCommentUseCase.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('DeleteCommentUseCase', () => {
  it('should orchestrate the delete comment action correctly', async () => {
    // Arrange
    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = vi.fn();
    mockCommentRepository.verifyCommentExists = vi.fn();
    mockCommentRepository.verifyCommentOwner = vi.fn();
    mockCommentRepository.deleteComment = vi.fn();

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCaseParam);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(useCaseParam.commentId);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(useCaseParam.commentId, useCaseParam.owner);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(useCaseParam.commentId);
  });
});
