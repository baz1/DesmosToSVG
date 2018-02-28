// ==UserScript==
// @name        DesmosToSVG
// @namespace   https://github.com/affogatoman/DesmosToSVG
// @description Desmos SVG generator
// @include     https://www.desmos.com/calculator
// @version     3
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// @require     https://raw.githubusercontent.com/gliffy/canvas2svg/master/canvas2svg.js
// ==/UserScript==

/* DesmosToSVG GreaseMonkey script by Remi Bazin */
/* Re-touched by Affogatoman under the MIT licence*/

var graph, ctx, ctx2, button;

var ctxHandler = {
  get: function(target, name) {
    if (typeof(ctx[name]) == "function") {
      if (name == "clearRect") {
        // Note: We assume it is the whole area
        ctx = new C2S(parseInt(graph.width), parseInt(graph.height));
        button.disabled = false;
        return function() { ctx2[name].apply(ctx2, arguments); }
      }
      return function() {
        ctx[name].apply(ctx, arguments);
        ctx2[name].apply(ctx2, arguments);
      };
    } else {
      return ctx2[name];
    }
  },
  set: function(target, name, value) {
    ctx[name] = value;
    ctx2[name] = value;
  }
};

function getSVG() {
  var nameContainer = document.getElementsByClassName("dcg-variable-title dcg-tooltip dcg-action-savedialog");
  var name = prompt("Enter the file name", nameContainer[0].innerHTML + ".svg");
  if(name == null || name == "")
    return;
  var a = document.createElement('a');
  a.setAttribute('href', "data:image/svg;base64," + btoa(ctx.getSerializedSvg(true)));
  a.setAttribute('target', '_blank');
  a.setAttribute('download', name);
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function myGetContext(contextType, contextAttributes) {
  ctx = new C2S(parseInt(graph.width), parseInt(graph.height));
  ctx2 = graph.myoldGetContext(contextType, contextAttributes);
  return new Proxy({}, ctxHandler);
}

function main() {
  graph = document.getElementsByClassName("dcg-graph-inner");
  if (graph.length != 1) {
    console.log("GM_DesmosSVG: Graph not found, or several found.");
    return;
  }
  graph = graph[0];
  var floaters = document.getElementsByClassName("align-right-container");
  if (floaters.length != 1) {
    console.log("GM_DesmosSVG: Floaters object not found, or several found.");
    return;
  }
  floaters = floaters[0];
  var spanObj = document.createElement("SPAN");
  button = document.createElement("INPUT");
  button.type = "button";
  button.disabled = true;
  button.addEventListener("click", getSVG, false);
  button.value = "Get SVG";
  spanObj.appendChild(button);
  floaters.appendChild(spanObj);
  console.log("GM_DesmosSVG: (Info) Button added.");
  graph.myoldGetContext = graph.getContext;
  graph.getContext = myGetContext;
  ctx = new C2S(parseInt(graph.width), parseInt(graph.height));
  var cL = window.tourController.Calc.grapher.canvasLayer;
  ctx2 = cL.ctx;
  cL.ctx = new Proxy({}, ctxHandler);
}

$(document).ready(function() {
  setTimeout(main, 3000);
});

