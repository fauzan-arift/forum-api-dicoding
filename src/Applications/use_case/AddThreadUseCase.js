import CreateThread from '../../Domains/threads/entities/CreateThread.js';

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const createThread = new CreateThread(useCasePayload);
    return this._threadRepository.addThread(createThread);
  }
}

export default AddThreadUseCase;
