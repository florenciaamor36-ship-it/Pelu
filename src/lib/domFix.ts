// Patch global DOM Node methods to prevent React crashes caused by Google Translate or browser extensions
if (typeof window !== 'undefined' && typeof Node === 'function') {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (child.parentNode) {
        try {
          return child.parentNode.removeChild(child) as T;
        } catch {
          // Suppress error
        }
      }
      return child;
    }
    try {
      return originalRemoveChild.call(this, child) as T;
    } catch {
      // Suppress DOM NotFoundError
      return child;
    }
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (referenceNode.parentNode) {
        try {
          return referenceNode.parentNode.insertBefore(newNode, referenceNode) as T;
        } catch {
          // Suppress error
        }
      }
      return newNode;
    }
    try {
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    } catch {
      // Suppress DOM NotFoundError
      return newNode;
    }
  };

  const originalReplaceChild = Node.prototype.replaceChild;
  Node.prototype.replaceChild = function <T extends Node>(
    newChild: Node,
    oldChild: T
  ): T {
    try {
      if (oldChild.parentNode !== this && oldChild.parentNode) {
        return oldChild.parentNode.replaceChild(newChild, oldChild) as T;
      }
      return originalReplaceChild.call(this, newChild, oldChild) as T;
    } catch {
      return oldChild;
    }
  };

  window.addEventListener(
    'error',
    (event) => {
      const msg = event.message || '';
      if (
        msg.includes('removeChild') ||
        msg.includes('insertBefore') ||
        msg.includes('replaceChild') ||
        msg.includes('is not a child of this node')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

export {};
