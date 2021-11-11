let linesBtn = document.getElementById("linesBtn");
  addEvent(linesBtn, 'click', function() {
      window.location.href = "index.html";
  });

let colorBtn = document.getElementById("colorBtn");
  addEvent(colorBtn, 'click', function() {
      window.location.href = "color.html";
  });
    
let flipBtn = document.getElementById("flipBtn");
  addEvent(flipBtn, 'click', function() {
      window.location.href = "flip.html";
  });


function addEvent(el, eventType, handler) {
  if (el.addEventListener) { 
      el.addEventListener(eventType, handler, false);
  } else if (el.attachEvent) { 
      el.attachEvent('on' + eventType, handler);
  } else { 
      el['on' + eventType] = handler;
  }
}
