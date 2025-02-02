// inputManager.js
import { CONFIG } from '../GAME/config.js';

export default class InputManager {
  constructor() {
    this.keys = new Set();
    this.mouse = { x: 0, y: 0 };
    this.mouseDown = false;

    // Bind event handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  attach() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  detach() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleKeyDown(e) {
    this.keys.add(e.key.toLowerCase());
  }

  handleKeyUp(e) {
    this.keys.delete(e.key.toLowerCase());
  }

  handleMouseMove(e) {
    const rect = e.target.getBoundingClientRect();
    const scaleX = CONFIG.VIRTUAL_WIDTH / rect.width;
    const scaleY = CONFIG.VIRTUAL_HEIGHT / rect.height;
    this.mouse.x = (e.clientX - rect.left) * scaleX;
    this.mouse.y = (e.clientY - rect.top) * scaleY;
  }

  handleMouseDown(e) {
    this.mouseDown = true;
  }

  handleMouseUp(e) {
    this.mouseDown = false;
  }

  isKeyDown(key) {
    return this.keys.has(key.toLowerCase());
  }

  isMouseDown() {
    return this.mouseDown;
  }
}
