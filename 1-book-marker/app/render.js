const parser = new DOMParser();

const linksSection = document.querySelector(".links");
const errorMessage = document.querySelector(".error-message");
const newLinkForm = document.querySelector(".new-link-form");
const newLinkUrl = document.querySelector(".new-link-url");
const newLinkSubmit = document.querySelector(".new-link-submit");
const clearStorageButton = document.querySelector(".clear-storage");

newLinkUrl.addEventListener("keyup", () => {
  newLinkSubmit.disabled = !newLinkUrl.validity.valid;
});
const clearForm = () => {
  newLinkUrl.value = null;
};
newLinkForm.addEventListener("submit", event => {
  event.preventDefault();
  const url = newLinkUrl.value;
  fetch(url)
    .then(res => res.text())
    .then(parseResponseText)
    .then(findTitle);
});
const parseResponseText = text => parser.parseFromString(text, "text/html");
const findTitle = nodes => nodes.querySelector("title").innerText;
