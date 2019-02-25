const button = document.querySelector('button')
button.addEventListener('click', () => {
    alert(__dirname) // alert is webAPI, __dirname is in node environment
})