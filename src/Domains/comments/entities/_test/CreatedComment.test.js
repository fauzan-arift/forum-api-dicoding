import CreatedComment from '../CreatedComment.js';

describe('CreatedComment', () => {
  it('should throw error when payload does not contain needed property', () => {
    expect(() => new CreatedComment({ id: 'x', content: 'y' }))
      .toThrowError('CREATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has wrong data type', () => {
    expect(() => new CreatedComment({ id: 1, content: 'y', owner: 'z' }))
      .toThrowError('CREATED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreatedComment object correctly', () => {
    const comment = new CreatedComment({ id: 'comment-1', content: 'nice', owner: 'user-1' });
    expect(comment.id).toBe('comment-1');
    expect(comment.content).toBe('nice');
    expect(comment.owner).toBe('user-1');
  });
});
