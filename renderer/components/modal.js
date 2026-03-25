export class Modal {
  constructor(options = {}) {
    this.modal = null;
    this.options = {
      title: 'Modal',
      content: '',
      onConfirm: null,
      onCancel: null,
      ...options
    };
  }

  open() {
    if (this.modal) return;
    this.modal = document.createElement('div');
    this.modal.className = 'modal-overlay';
    this.modal.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <h2>${this.options.title}</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${this.options.content}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary cancel-btn">Cancel</button>
          <button class="btn btn-primary confirm-btn">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.modal);

    const closeBtn = this.modal.querySelector('.modal-close');
    const cancelBtn = this.modal.querySelector('.cancel-btn');
    const confirmBtn = this.modal.querySelector('.confirm-btn');

    const close = () => this.close();
    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);
    confirmBtn.addEventListener('click', () => {
      if (this.options.onConfirm) this.options.onConfirm();
      this.close();
    });
  }

  close() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }
}