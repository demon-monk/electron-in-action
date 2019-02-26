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
    .then(findTitle)
    .then(title => storeLink(title, url))
    .then(clearForm)
    .then(renderLinks);
});
clearStorageButton.addEventListener('click', () => clearStorage())
const parseResponseText = text => parser.parseFromString(text, "text/html");
const findTitle = nodes => nodes.querySelector("title").innerText;
const storeLink = (title, url) => {
  localStorage.setItem(url, JSON.stringify({ title, url }));
};
const getLink = () =>
  Object.keys(localStorage).map(key => JSON.parse(localStorage.getItem(key)));
const getItemElement = link => `
<div class="link">
<h3>${link.title}</h3>
<p><a href="${link.url}">${link.url}</a></p>
</div>
`;
const renderLinks = () =>
  (linksSection.innerHTML = getLink()
    .map(getItemElement)
    .join(""));
const clearStorage = () => {
    localStorage.clear()
    linksSection.innerHTML = ''
}
renderLinks()