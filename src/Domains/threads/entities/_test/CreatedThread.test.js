import CreatedThread from '../CreatedThread.js';

describe('CreatedThread', () => {
  it('should throw error when payload does not contain needed property', () => {
    expect(() => new CreatedThread({ id: 'x', title: 'y' }))
      .toThrowError('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has wrong data type', () => {
    expect(() => new CreatedThread({ id: 1, title: 'y', owner: 'z' }))
      .toThrowError('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreatedThread object correctly', () => {
    const thread = new CreatedThread({ id: 'thread-1', title: 'a title', owner: 'user-1' });
    expect(thread.id).toBe('thread-1');
    expect(thread.title).toBe('a title');
    expect(thread.owner).toBe('user-1');
  });
});
