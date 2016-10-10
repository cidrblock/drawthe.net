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
    } else if (e.ctrlKey && e.keyCode == 221) {
      e.preventDefault()
      var button = document.getElementById('fullScreen')
      button.click()
      return false;
    }

  }
// register the handler
document.addEventListener('keyup', doc_keyUp, false);

function copyToClipboard(text) {

  // Create a "hidden" input
  var aux = document.createElement("input");

  // Assign it the value of the specified element
  aux.setAttribute("value", text);

  // Append it to the body
  document.body.appendChild(aux);

  // Highlight its content
  aux.select();

  // Copy the highlighted text
  document.execCommand("copy");

  // Remove it from the body
  document.body.removeChild(aux);

}
