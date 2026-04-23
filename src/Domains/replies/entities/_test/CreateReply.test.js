import CreateReply from '../CreateReply.js';

describe('CreateReply', () => {
  it('should throw error when payload does not contain needed property', () => {
    expect(() => new CreateReply({ content: 'a', commentId: 'b' }))
      .toThrowError('CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has wrong data type', () => {
    expect(() => new CreateReply({ content: 123, commentId: 'b', owner: 'u' }))
      .toThrowError('CREATE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateReply object correctly', () => {
    const reply = new CreateReply({ content: 'nice reply', commentId: 'comment-1', owner: 'user-1' });
    expect(reply.content).toBe('nice reply');
    expect(reply.commentId).toBe('comment-1');
    expect(reply.owner).toBe('user-1');
  });
});
