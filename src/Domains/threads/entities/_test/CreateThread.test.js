import CreateThread from '../CreateThread.js';

describe('CreateThread', () => {
  it('should throw error when payload does not contain needed property', () => {
    expect(() => new CreateThread({ title: 'a', body: 'b' }))
      .toThrowError('CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload has wrong data type', () => {
    expect(() => new CreateThread({ title: 123, body: 'b', owner: 'u' }))
      .toThrowError('CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateThread object correctly', () => {
    const thread = new CreateThread({ title: 'a title', body: 'a body', owner: 'user-1' });
    expect(thread.title).toBe('a title');
    expect(thread.body).toBe('a body');
    expect(thread.owner).toBe('user-1');
  });
});
