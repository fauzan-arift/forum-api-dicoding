import CreatedReply from '../CreatedReply.js';

describe('CreatedReply', () => {
  it('should throw error when payload does not contain needed property', () => {
    expect(() => new CreatedReply({ id: 'x', content: 'y' }))
      .toThrowError('CREATED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has wrong data type', () => {
    expect(() => new CreatedReply({ id: 1, content: 'y', owner: 'z' }))
      .toThrowError('CREATED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreatedReply object correctly', () => {
    const reply = new CreatedReply({ id: 'reply-1', content: 'nice reply', owner: 'user-1' });
    expect(reply.id).toBe('reply-1');
    expect(reply.content).toBe('nice reply');
    expect(reply.owner).toBe('user-1');
  });
});
