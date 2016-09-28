function doc_keyUp(e) {
    if (e.ctrlKey && e.keyCode == 13) {
        e.preventDefault()
        document.getElementById('draw').click();
        return false;
    }
  }
// register the handler
document.addEventListener('keyup', doc_keyUp, false);
