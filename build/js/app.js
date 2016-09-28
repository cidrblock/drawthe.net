function doc_keyUp(e) {
    if ((e.ctrlKey && e.keyCode == 13) || (e.keyCode == 27)){
        e.preventDefault()
        var button = document.getElementById('draw')
        if (button) {
          button.click()
        } else {
          var design = window.opener.design;
          draw(design);
        }
        return false;
    }

  }
// register the handler
document.addEventListener('keyup', doc_keyUp, false);
