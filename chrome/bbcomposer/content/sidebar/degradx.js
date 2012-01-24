function degradx_plus(code, color)
	{
	var box = document.getElementById(code + '-colorpickers');
	var colorpicker = document.createElement('colorpicker');
	colorpicker.setAttribute('type', 'button');
	colorpicker.setAttribute('flex', '1');
	box.appendChild(colorpicker);
	if(color)
		colorpicker.color = color;
	}

function degradx_minus(code)
	{
	var box = document.getElementById(code + '-colorpickers');
	if(box.childNodes.length>1)
		box.removeChild(box.lastChild);
	else
		box.firstChild.color='transparent';
	}

function degradx_apply(code)
	{
	var box = document.getElementById(code + '-colorpickers');
	var blocks = window.parent.myBBComposerManager.focusedBBComposer.getSelectedBlocks();
	var colors="";
	var i=0;
	while(box.childNodes[i]&&box.childNodes[i].color&&box.childNodes[i].color!='transparent')
		{
		colors += (i>0 ? '-' : '') + box.childNodes[i].color;
		i++;
		}
	if(blocks.length&&box.childNodes.length==1&&colors!="")
		{
		for(var i=0; i<blocks.length; i++)
			{
			if(blocks[i].toString().length)
				{
				var newElement = window.parent.myBBComposerManager.focusedBBComposer.editor.contentDocument.createElement('span');
				if(code=='x')
					newElement.setAttribute('style','color: ' + colors + ';');
				else if(code=='y')
					newElement.setAttribute('style','background-color: ' + colors + ';');
				window.parent.myBBComposerManager.focusedBBComposer.doAction({actionFunction: window.parent.myBBComposerManager.focusedBBComposer.exchangeElementChildNodes, sourceElement: blocks[i], targetElement: newElement});
				window.parent.myBBComposerManager.focusedBBComposer.doAction({actionFunction: window.parent.myBBComposerManager.focusedBBComposer.insertElement, parentElement: blocks[i], theElement: newElement, focusNode: newElement});
				}
			}
		}
	if(blocks.length&&box.childNodes.length>1&&colors!="")
		{
		degradx_remove(code);
		for(var i=0; i<blocks.length; i++)
			{
			if(blocks[i].toString().length)
				{
				var newElement = window.parent.myBBComposerManager.focusedBBComposer.editor.contentDocument.createElement('span');
				newElement.setAttribute('class',code);
				newElement.setAttribute('title',colors);
				window.parent.myBBComposerManager.focusedBBComposer.doAction({actionFunction: window.parent.myBBComposerManager.focusedBBComposer.exchangeElementChildNodes, sourceElement: blocks[i], targetElement: newElement});
				window.parent.myBBComposerManager.focusedBBComposer.doAction({actionFunction: window.parent.myBBComposerManager.focusedBBComposer.insertElement, parentElement: blocks[i], theElement: newElement, focusNode: newElement});
				}
			}
		}
	}

function degradx_remove(code)
	{
	var blocks = window.parent.myBBComposerManager.focusedBBComposer.getSelectedBlocks();
	for(var i=0; i<blocks.length; i++)
		{
		var spans = blocks[i].getElementsByTagName('span');
		for(var i=0; i<spans.length; i++)
			{
			if(spans[i].hasAttribute('class')&&spans[i].getAttribute('class')==code)
				{
				window.parent.myBBComposerManager.focusedBBComposer.doAction({actionFunction: window.parent.myBBComposerManager.focusedBBComposer.exchangeElementChildNodes, sourceElement: spans[i], targetElement: spans[i].parentNode, nextElement: spans[i]});
				/* UNKNOW BUG : Very strange !!!
				if(spans[i].firstChild)
					alert(spans[i].firstChild.nodeName+' '+spans[i].firstChild.textContent);*/
				window.parent.myBBComposerManager.focusedBBComposer.doAction({actionFunction: window.parent.myBBComposerManager.focusedBBComposer.removeElement, theElement: spans[i]});
				}
			}
		}
	}

function getElementsByNodeName(parent, nodeName, elements)
	{
	if(!elements)
		elements = new Array();
	for (var i=0; i<parent.childNodes.length; i++)
		{
		if(parent.childNodes[i].nodeName == nodeName)
			elements[elements.length] = parent.childNodes[i];
		if(parent.childNodes[i].hasChildNodes())
			elements.concat(getElementsByNodeName(parent.childNodes[i], nodeName, elements));
		}
	return elements;
	}

function getElementsByAttributeValue(parent, attribute, attributeValue, elements)
	{
	if(!elements)
		elements = new Array();
	for (var i=0; i<parent.childNodes.length; i++)
		{
		if(parent.childNodes[i].attributes&&parent.childNodes[i].nodeName!="#text"&&parent.childNodes[i].hasAttribute(attribute)&&parent.childNodes[i].getAttribute(attribute) == attributeValue)
			elements[elements.length] = parent.childNodes[i];
		if(parent.childNodes[i].hasChildNodes())
			elements.concat(getElementsByAttributeValue(parent.childNodes[i], attribute, attributeValue, elements));
		}
	return elements;
	}

function degradx_clear()
	{
	var elements = getElementsByAttributeValue(window.parent.myBBComposerManager.focusedBBComposer.editor.contentDocument.body, 'title', 't');
	for(var i=0; i<elements.length; i++)
		{
		window.parent.myBBComposerManager.focusedBBComposer.doAction({actionFunction: window.parent.myBBComposerManager.focusedBBComposer.exchangeElementChildNodes, sourceElement: elements[i], targetElement: elements[i].parentNode, nextElement: elements[i]});
		window.parent.myBBComposerManager.focusedBBComposer.doAction({actionFunction: window.parent.myBBComposerManager.focusedBBComposer.removeElement, theElement: elements[i]});
		}
	}

function degradx_get_color(pos,max,colors)
	{
	if(pos>=max)
		var cC = new bbcColor(colors[colors.length-1]);	
	else
		{
		var n = Math.floor((pos/max)*(colors.length-1));
		var cC = new bbcColor(colors[n]);
		var lC = new bbcColor(colors[n]);
		var rC = new bbcColor(colors[n+1]);
		if(lC.getR() < rC.getR())
			cC.setR(lC.getR() + Math.round((pos-(n*(max/(colors.length-1)))) * ( (rC.getR()-lC.getR()) / (max/(colors.length-1)))));
		else
			cC.setR(lC.getR() - Math.round((pos-(n*(max/(colors.length-1)))) * ( (lC.getR()-rC.getR()) / (max/(colors.length-1)))));
		if(lC.getG() < rC.getG())
			cC.setG(lC.getG() + Math.round((pos-(n*(max/(colors.length-1)))) * ( (rC.getG()-lC.getG()) / (max/(colors.length-1)))));
		else
			cC.setG(lC.getG() - Math.round((pos-(n*(max/(colors.length-1)))) * ( (lC.getG()-rC.getG()) / (max/(colors.length-1)))));
		if(lC.getB() < rC.getB())
			cC.setB(lC.getB() + Math.round((pos-(n*(max/(colors.length-1)))) * ( (rC.getB()-lC.getB()) / (max/(colors.length-1)))));
		else
			cC.setB(lC.getB() - Math.round((pos-(n*(max/(colors.length-1)))) * ( (lC.getB()-rC.getB()) / (max/(colors.length-1)))));
		}
	return cC.getRGB();
	}

function degradx_degrad(element)
	{
	var colors = element.title.split('-');
	var elementInnerHTML = "";
	var newElement ="";
	var BRElements = element.getElementsByTagName('br');
	var max = BRElements.length;
	if(BRElements.length<2)
		{
		var k = 0;
		max = 0;
		var textNodes = getElementsByNodeName(element, '#text');
		for(var i=0; i<textNodes.length; i++)
			{
			max += textNodes[i].length;
			}
		for(var i=0; i<textNodes.length; i++)
			{
			for(var j=0; j<textNodes[i].length; j++)
				{
				var newElement = window.parent.myBBComposerManager.focusedBBComposer.editor.contentDocument.createElement('span');
				newElement.innerHTML = textNodes[i].data.charAt(j);
				newElement.setAttribute('title', 't');
				if(element.getAttribute('class')=='x')
					newElement.style.color = degradx_get_color(k,max,colors);
				else
					newElement.setAttribute("style", "background-color: "+degradx_get_color(k,max,colors)+";");
				window.parent.myBBComposerManager.focusedBBComposer.doAction({actionFunction: window.parent.myBBComposerManager.focusedBBComposer.insertElement, nextElement: textNodes[i], theElement: newElement});
				k++;
				}
			window.parent.myBBComposerManager.focusedBBComposer.doAction({actionFunction: window.parent.myBBComposerManager.focusedBBComposer.removeElement, theElement: textNodes[i]});
			}
		}
	else
		{
		for(var i=0; i<=max; i++)
			{
			var newElement = window.parent.myBBComposerManager.focusedBBComposer.editor.contentDocument.createElement('span');
			newElement.setAttribute('title', 't');
			if(element.getAttribute('class')=='x')
				newElement.style.color = degradx_get_color(i,max,colors);
			else
				newElement.setAttribute("style", "background-color: "+degradx_get_color(i,max,colors)+";");
			window.parent.myBBComposerManager.focusedBBComposer.doAction({actionFunction: window.parent.myBBComposerManager.focusedBBComposer.exchangeElementChildNodes, sourceElement: BRElements[i].parentNode, targetElement: newElement, startAfter: BRElements[i].parentNode, stopAfter: BRElements[i+1].previousSibling});
			window.parent.myBBComposerManager.focusedBBComposer.doAction({actionFunction: window.parent.myBBComposerManager.focusedBBComposer.insertElement, theElement: newElement, previousElement: BRElements[i]});
			}
		}
	}

function degradx_refresh()
	{
	if(window.parent.myBBComposerManager.focusedBBComposer&&window.parent.myBBComposerManager.focusedBBComposer.editor.contentDocument)
		{
		degradx_clear();
		var elements = getElementsByAttributeValue(window.parent.myBBComposerManager.focusedBBComposer.editor.contentDocument.body, 'class', 'x');
		elements = getElementsByAttributeValue(window.parent.myBBComposerManager.focusedBBComposer.editor.contentDocument.body, 'class', 'y', elements);
		for(var i=0; i<elements.length; i++)
			degradx_degrad(elements[i]);
		}
	degradx_interval = setTimeout('degradx_refresh()', document.getElementById('degradx_refresh_delay').value*1000);
	}

function degradx_init()
	{
	window.parent.myBBComposerManager.toggleSidebar('degradx', true);
	degradx_refresh();
	document.removeEventListener('load', degradx_init, false);
	document.addEventListener('unload', degradx_uninit, false);
	}

function degradx_uninit()
	{
	window.clearTimeout(degradx_interval);
	window.parent.myBBComposerManager.toggleSidebar('degradx',false);
	}

var degradx_interval;
window.addEventListener('load', degradx_init, false);