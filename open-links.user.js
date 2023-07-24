// ==UserScript==
// @name         Open Links
// @namespace    https://github.com/mefengl
// @version      0.0.2
// @description  Select links with Z key and open them in new tabs
// @author       mefengl
// @include      *
// @grant        GM.openInTab
// ==/UserScript==

(function () {
  'use strict';

  let selectionRectangle = null;
  let elementsInsideRectangle = [];
  let countLabel = null;
  let zKeyPressed = false;
  let startX, startY;

  // Function to create the selection rectangle
  function createRectangle(x, y) {
    let div = document.createElement('div');
    div.style.border = '1px dashed red';
    div.style.position = 'fixed';
    div.style.pointerEvents = 'none';
    return div;
  }

  // Function to create the count label
  function createCountLabel() {
    let div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.bottom = '0px';
    div.style.right = '5px';
    div.style.backgroundColor = 'transparent';
    return div;
  }

  // Function to detect <a> elements inside the rectangle
  function detectElementsInRectangle() {
    elementsInsideRectangle = Array.from(document.querySelectorAll('a')).filter(el => {
      let rect = el.getBoundingClientRect();
      return rect.top >= parseInt(selectionRectangle.style.top) && rect.left >= parseInt(selectionRectangle.style.left) && rect.bottom <= (parseInt(selectionRectangle.style.top) + parseInt(selectionRectangle.style.height)) && rect.right <= (parseInt(selectionRectangle.style.left) + parseInt(selectionRectangle.style.width));
    });

    elementsInsideRectangle.forEach(el => el.style.border = '1px solid red');  // Add red border to <a> elements

    // Update the count label
    countLabel.innerText = elementsInsideRectangle.length;
  }

  // Function to remove the border from <a> elements no longer inside the rectangle
  function removeBordersFromLinks() {
    document.querySelectorAll('a').forEach(el => el.style.border = '');  // Remove border
  }

  // Key down event
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'z') {
      zKeyPressed = true;
    }
  });

  // Key up event
  document.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'z') {
      zKeyPressed = false;
    }
  });

  // Mouse down event
  document.addEventListener('mousedown', (e) => {
    if (!zKeyPressed) return;
    e.preventDefault();  // Prevent text selection
    removeBordersFromLinks();
    startX = e.clientX;
    startY = e.clientY;
    selectionRectangle = createRectangle(startX, startY);
    document.body.appendChild(selectionRectangle);
    countLabel = createCountLabel();
    selectionRectangle.appendChild(countLabel);
  });

  // Mouse move event
  document.addEventListener('mousemove', (e) => {
    if (!zKeyPressed || !selectionRectangle) return;
    e.preventDefault();  // Prevent text selection
    removeBordersFromLinks();
    selectionRectangle.style.left = Math.min(e.clientX, startX) + 'px';
    selectionRectangle.style.top = Math.min(e.clientY, startY) + 'px';
    selectionRectangle.style.width = Math.abs(e.clientX - startX) + 'px';
    selectionRectangle.style.height = Math.abs(e.clientY - startY) + 'px';
    detectElementsInRectangle();
  });

  function openLinksInBackground(urls) {
    urls.forEach((url) => {
      GM.openInTab(url, true);
    });
  }

  // Mouse up event
  document.addEventListener('mouseup', (e) => {
    if (!zKeyPressed || !selectionRectangle) return;
    e.preventDefault();  // Prevent text selection
    let urlsToOpen = elementsInsideRectangle.map(el => el.href);
    openLinksInBackground(urlsToOpen);
    document.body.removeChild(selectionRectangle);
    removeBordersFromLinks();
    selectionRectangle = null;
  });

})();
