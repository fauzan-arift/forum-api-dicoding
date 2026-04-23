import CreateComment from '../CreateComment.js';

describe('CreateComment', () => {
  it('should throw error when payload does not contain needed property', () => {
    expect(() => new CreateComment({ content: 'a', threadId: 'b' }))
      .toThrowError('CREATE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has wrong data type', () => {
    expect(() => new CreateComment({ content: 123, threadId: 'b', owner: 'u' }))
      .toThrowError('CREATE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateComment object correctly', () => {
    const comment = new CreateComment({ content: 'nice', threadId: 'thread-1', owner: 'user-1' });
    expect(comment.content).toBe('nice');
    expect(comment.threadId).toBe('thread-1');
    expect(comment.owner).toBe('user-1');
  });
});
