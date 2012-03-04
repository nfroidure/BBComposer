function DegradXManager()
	{
	this.loadHandler=ewkLib.newEventHandler(this,this.load);
	window.addEventListener('load', this.loadHandler, false);
	};

DegradXManager.prototype.load = function ()
	{
	window.removeEventListener('load', this.loadHandler, false);
	var evt = window.parent.document.createEvent('Events');
	evt.initEvent('sidebarload', true, true);
	evt.sidebarWindow=this;
	evt.sidebarName='degradx';
	if(window.parent)
		window.parent.dispatchEvent(evt);
	}

DegradXManager.prototype.run = function (editorManager)
	{
	this.editorManager=editorManager;
	this.unLoadHandler=ewkLib.newEventHandler(this,this.unLoad);
	window.addEventListener('unload', this.unLoadHandler, false);
	this.displayHandler=ewkLib.newEventHandler(this,this.display);
	document.addEventListener('display', this.displayHandler, false);
	this.minusHandler=ewkLib.newEventHandler(this,this.minus);
	document.getElementById('x-minus-button').addEventListener('command', this.minusHandler, false);
	document.getElementById('y-minus-button').addEventListener('command', this.minusHandler, false);
	this.plusHandler=ewkLib.newEventHandler(this,this.plus);
	document.getElementById('x-plus-button').addEventListener('command', this.plusHandler, false);
	document.getElementById('y-plus-button').addEventListener('command', this.plusHandler, false);
	this.removeHandler=ewkLib.newEventHandler(this,this.remove);
	document.getElementById('x-remove-button').addEventListener('command', this.removeHandler, false);
	document.getElementById('y-remove-button').addEventListener('command', this.removeHandler, false);
	this.applyHandler=ewkLib.newEventHandler(this,this.apply);
	document.getElementById('x-apply-button').addEventListener('command', this.applyHandler, false);
	document.getElementById('y-apply-button').addEventListener('command', this.applyHandler, false);
	this.refreshHandler=ewkLib.newEventHandler(this,this.refresh);
	this.display();
	this.refresh();
	}

DegradXManager.prototype.display = function ()
	{
	var curElement = this.editorManager.focusedBBComposer.getSelectedElement();
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
				this.doPlus(curElement.getAttribute('class'), colors[i]);
			}
		curElement = curElement.parentNode;
		}
	}

DegradXManager.prototype.apply = function (hEvent)
	{
	var code=hEvent.target.getAttribute('id').charAt(0);
	var box = document.getElementById(code + '-colorpickers');
	var blocks = this.editorManager.focusedBBComposer.getSelectedBlocks();
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
				var newElement = this.editorManager.focusedBBComposer.editor.contentDocument.createElement('span');
				if(code=='x')
					newElement.setAttribute('style','color: ' + colors + ';');
				else if(code=='y')
					newElement.setAttribute('style','background-color: ' + colors + ';');
				this.editorManager.focusedBBComposer.doAction({actionFunction: this.editorManager.focusedBBComposer.exchangeElementChildNodes, sourceElement: blocks[i], targetElement: newElement});
				this.editorManager.focusedBBComposer.doAction({actionFunction: this.editorManager.focusedBBComposer.insertElement, parentElement: blocks[i], theElement: newElement, focusNode: newElement});
				}
			}
		}
	if(blocks.length&&box.childNodes.length>1&&colors!="")
		{
		this.doRemove(code);
		for(var i=0; i<blocks.length; i++)
			{
			if(blocks[i].toString().length)
				{
				var newElement = this.editorManager.focusedBBComposer.editor.contentDocument.createElement('span');
				newElement.setAttribute('class',code);
				newElement.setAttribute('title',colors);
				this.editorManager.focusedBBComposer.doAction({actionFunction: this.editorManager.focusedBBComposer.exchangeElementChildNodes, sourceElement: blocks[i], targetElement: newElement});
				this.editorManager.focusedBBComposer.doAction({actionFunction: this.editorManager.focusedBBComposer.insertElement, parentElement: blocks[i], theElement: newElement, focusNode: newElement});
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

DegradXManager.prototype.remove = function (hEvent)
	{
	this.doRemove(hEvent.target.getAttribute('id').charAt(0));
	}

DegradXManager.prototype.doRemove = function (code)
	{
	var blocks = this.editorManager.focusedBBComposer.getSelectedBlocks();
	for(var i=0; i<blocks.length; i++)
		{
		var spans = blocks[i].getElementsByTagName('span');
		for(var i=0; i<spans.length; i++)
			{
			if(spans[i].hasAttribute('class')&&spans[i].getAttribute('class')==code)
				{
				this.editorManager.focusedBBComposer.doAction({actionFunction: this.editorManager.focusedBBComposer.exchangeElementChildNodes, sourceElement: spans[i], targetElement: spans[i].parentNode, nextElement: spans[i]});
				/* UNKNOW BUG : Very strange !!!
				if(spans[i].firstChild)
					alert(spans[i].firstChild.nodeName+' '+spans[i].firstChild.textContent);*/
				this.editorManager.focusedBBComposer.doAction({actionFunction: this.editorManager.focusedBBComposer.removeElement, theElement: spans[i]});
				}
			}
		}
	}

DegradXManager.prototype.minus  = function (hEvent)
	{
	var code=hEvent.target.getAttribute('id').charAt(0);
	var box = document.getElementById(code + '-colorpickers');
	if(box.childNodes.length>1)
		box.removeChild(box.lastChild);
	else
		box.firstChild.color='transparent';
	}

DegradXManager.prototype.plus  = function (hEvent)
	{
	var code=hEvent.target.getAttribute('id').charAt(0);
	this.doPlus(code);
	}

DegradXManager.prototype.doPlus = function (code,color)
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
				var newElement = this.editorManager.focusedBBComposer.editor.contentDocument.createElement('span');
				newElement.innerHTML = textNodes[i].data.charAt(j);
				newElement.setAttribute('title', 't');
				if(element.getAttribute('class')=='x')
					newElement.style.color = this.getColor(k,max,colors);
				else
					newElement.setAttribute("style", "background-color: "+this.getColor(k,max,colors)+";");
				this.editorManager.focusedBBComposer.doAction({actionFunction: this.editorManager.focusedBBComposer.insertElement, nextElement: textNodes[i], theElement: newElement});
				k++;
				}
			this.editorManager.focusedBBComposer.doAction({actionFunction: this.editorManager.focusedBBComposer.removeElement, theElement: textNodes[i]});
			}
		}
	else
		{
		for(var i=0; i<=max; i++)
			{
			var newElement = this.editorManager.focusedBBComposer.editor.contentDocument.createElement('span');
			newElement.setAttribute('title', 't');
			if(element.getAttribute('class')=='x')
				newElement.style.color = this.getColor(i,max,colors);
			else
				newElement.setAttribute("style", "background-color: "+this.getColor(i,max,colors)+";");
			this.editorManager.focusedBBComposer.doAction({actionFunction: this.editorManager.focusedBBComposer.exchangeElementChildNodes, sourceElement: BRElements[0].parentNode, targetElement: newElement, startAfter: (i>0?BRElements[i-1]:null), stopAt: (i<max?BRElements[i]:null)});
			this.editorManager.focusedBBComposer.doAction({actionFunction: this.editorManager.focusedBBComposer.insertElement, theElement: newElement, nextElement: (i<max?BRElements[i]:null), parentElement: (i==max?BRElements[0].parentNode:null)});
			}
		}
	}

DegradXManager.prototype.clear = function ()
	{
	var elements = this.editorManager.focusedBBComposer.editor.contentDocument.body.querySelectorAll('span[title="t"]');
	for(var i=0; i<elements.length; i++)
		{
		this.editorManager.focusedBBComposer.doAction({actionFunction: this.editorManager.focusedBBComposer.exchangeElementChildNodes, sourceElement: elements[i], targetElement: elements[i].parentNode, nextElement: elements[i]});
		this.editorManager.focusedBBComposer.doAction({actionFunction: this.editorManager.focusedBBComposer.removeElement, theElement: elements[i]});
		}
	}

DegradXManager.prototype.refresh = function (event)
	{
	if(this.editorManager.focusedBBComposer&&this.editorManager.focusedBBComposer.editor.contentDocument)
		{
		this.clear();
		var elements = this.editorManager.focusedBBComposer.editor.contentDocument.querySelectorAll(".x, .y");
		for(var i=0; i<elements.length; i++)
			this.degrad(elements[i]);
		}
	this.refreshInterval=setTimeout(this.refreshHandler, document.getElementById('degradx_refresh_delay').value*1000);
	}

DegradXManager.prototype.unLoad = function ()
	{
	window.clearTimeout(this.refreshInterval);
	window.removeEventListener('unload', this.unLoadHandler, false);
	this.editorManager.toggleSidebar('degradx',false);
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