function DegradXManager()
	{
	this.loadHandler=ewkLib.newEventHandler(this,this.load);
	window.addEventListener('load', this.loadHandler, false);
	};

DegradXManager.prototype.load = function ()
	{
	document.removeEventListener('load', this.loadHandler, false);
	if(window.parent.myBBComposerManager.toggleSidebar('degradx', true))
		{
		this.unLoadHandler=ewkLib.newEventHandler(this,this.unLoad);
		document.addEventListener('unload', this.unLoadHandler, false);
		this.displayHandler=ewkLib.newEventHandler(this,this.display);
		document.addEventListener('display', this.displayHandler, false);
		this.refreshHandler=ewkLib.newEventHandler(this,this.refresh);
		this.display();
		this.refresh();
		}
	}

DegradXManager.prototype.display = function ()
	{
	var curElement = window.parent.myBBComposerManager.focusedBBComposer.getSelectedElement();
	while(curElement&&curElement.nodeName.toLowerCase()!='body')
		{
		if(curElement.hasAttribute('class')&&(curElement.getAttribute('class')=='x'||curElement.getAttribute('class')=='y'))
			{
			var colors = curElement.getAttribute('title').split('-');
			var box = document.getElementById(curElement.getAttribute('class') + '-colorpickers');
			while(box.childNodes.length>1)
				box.removeChild(box.lastChild);
			box.firstChild.color = colors[0];
			for(var i=1; i<colors.length; i++)
				this.plus(curElement.getAttribute('class'), colors[i]);
			}
		curElement = curElement.parentNode;
		}
	}

DegradXManager.prototype.apply = function (code)
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
		this.remove(code);
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

DegradXManager.prototype.getColor = function (pos,max,colors)
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

DegradXManager.prototype.remove = function (code)
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

DegradXManager.prototype.minus = function (code)
	{
	var box = document.getElementById(code + '-colorpickers');
	if(box.childNodes.length>1)
		box.removeChild(box.lastChild);
	else
		box.firstChild.color='transparent';
	}

DegradXManager.prototype.plus = function (code,color)
	{
	var box = document.getElementById(code + '-colorpickers');
	var colorpicker = document.createElement('colorpicker');
	colorpicker.setAttribute('type', 'button');
	colorpicker.setAttribute('flex', '1');
	box.appendChild(colorpicker);
	if(color)
		colorpicker.color = color;
	}

DegradXManager.prototype.degrad = function (element)
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
					newElement.style.color = this.getColor(k,max,colors);
				else
					newElement.setAttribute("style", "background-color: "+this.getColor(k,max,colors)+";");
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
				newElement.style.color = this.getColor(i,max,colors);
			else
				newElement.setAttribute("style", "background-color: "+this.getColor(i,max,colors)+";");
			window.parent.myBBComposerManager.focusedBBComposer.doAction({actionFunction: window.parent.myBBComposerManager.focusedBBComposer.exchangeElementChildNodes, sourceElement: BRElements[0].parentNode, targetElement: newElement, startAfter: (i>0?BRElements[i-1]:null), stopAt: (i<max?BRElements[i]:null)});
			window.parent.myBBComposerManager.focusedBBComposer.doAction({actionFunction: window.parent.myBBComposerManager.focusedBBComposer.insertElement, theElement: newElement, nextElement: (i<max?BRElements[i]:null), parentElement: (i==max?BRElements[0].parentNode:null)});
			}
		}
	}

DegradXManager.prototype.clear = function ()
	{
	var elements = window.parent.myBBComposerManager.focusedBBComposer.editor.contentDocument.body.querySelectorAll('span[title="t"]');
	for(var i=0; i<elements.length; i++)
		{
		window.parent.myBBComposerManager.focusedBBComposer.doAction({actionFunction: window.parent.myBBComposerManager.focusedBBComposer.exchangeElementChildNodes, sourceElement: elements[i], targetElement: elements[i].parentNode, nextElement: elements[i]});
		window.parent.myBBComposerManager.focusedBBComposer.doAction({actionFunction: window.parent.myBBComposerManager.focusedBBComposer.removeElement, theElement: elements[i]});
		}
	}

DegradXManager.prototype.refresh = function (event)
	{
	if(window.parent.myBBComposerManager.focusedBBComposer&&window.parent.myBBComposerManager.focusedBBComposer.editor.contentDocument)
		{
		this.clear();
		var elements = window.parent.myBBComposerManager.focusedBBComposer.editor.contentDocument.querySelectorAll(".x, .y");
		for(var i=0; i<elements.length; i++)
			this.degrad(elements[i]);
		}
	this.refreshInterval=setTimeout(this.refreshHandler, document.getElementById('degradx_refresh_delay').value*1000);
	}

DegradXManager.prototype.unLoad = function ()
	{
	window.clearTimeout(this.refreshInterval);
	document.removeEventListener('unload', this.unLoadHandler, false);
	window.parent.myBBComposerManager.toggleSidebar('degradx',false);
	}

var degradx=new DegradXManager();

function getElementsByNodeName(parent, nodeName, elements)
	{
//NodeFilter.SHOW_TEXT    https://developer.mozilla.org/en/DOM/document.createTreeWalker
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