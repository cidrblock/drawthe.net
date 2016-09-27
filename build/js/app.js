function doc_keyUp(e) {
    // this would test for whichever key is 40 and the ctrl key at the same time
    if (e.ctrlKey && e.keyCode == 13) {
        e.preventDefault()
        // call your function to do the thing
        document.getElementById('draw').click();
        return false;
    }
}
// register the handler
document.addEventListener('keyup', doc_keyUp, false);
