function bbcomposer(editor, language, textarea, manager)
	{
	this.myBBComposerManager = manager;
	this.document = textarea.ownerDocument;
	this.editor = editor;
	this.language = language;
	this.textarea = textarea;
	this.bbcLanguageSupport=window['bbc'+this.language.substring(0,1).toUpperCase()+this.language.substring(1)+'Support'];
	this.originalContent = textarea.value;
	// Overwrite base if base element
	this.base = this.document.location.href.replace(/(.+)\/([^\/]*)/, '$1/');
	var bases = document.getElementsByTagName('base');
	if(bases.length&&bases[0]&&bases[0].hasAttribute('href'))
		base=bases[0].getAttribute('href').replace(/(.+)\/([^\/]*)/, '$1/');
	this.autoSaveTimeout = false;
	this.lastSaveAction=false;
	this.initHandler=this.myBBComposerManager.newEventHandler(this, this.init,'initHandler');
	this.fileExistsHandler=this.myBBComposerManager.newEventHandler(this, this.fileExists,'fileExistsHandler');
	this.fileUploadedHandler=this.myBBComposerManager.newEventHandler(this, this.fileUploaded,'fileUploadedHandler');
	this.editor.addEventListener("load", this.initHandler, true);
	};
	bbcomposer.prototype.init = function ()
		{
		this.editor.removeEventListener('load', this.initHandler, true);
		this.initHandler = undefined;
		this.rootElement = this.editor.contentDocument.body;
		// Editor events
		this.editor.contentDocument.addEventListener('dblclick',this.myBBComposerManager.newEventHandler(this, this.handleEvent,''),true);
		this.editor.contentDocument.addEventListener('click',this.myBBComposerManager.newEventHandler(this, this.handleEvent,''),true);
		this.editor.contentDocument.addEventListener('mouseup',this.myBBComposerManager.newEventHandler(this, this.handleEvent,''),true);
		this.editor.contentDocument.addEventListener('keydown',this.myBBComposerManager.newEventHandler(this, this.handleEvent,''),true);
		this.editor.contentDocument.addEventListener('keyup',this.myBBComposerManager.newEventHandler(this, this.handleEvent,''),true);
		this.editor.contentDocument.addEventListener('keypress',this.myBBComposerManager.newEventHandler(this, this.handleEvent,''),true);
		this.editor.contentDocument.addEventListener('focus',this.myBBComposerManager.newEventHandler(this, this.handleEvent,''),true);
		this.editor.contentDocument.addEventListener('drag',this.myBBComposerManager.newEventHandler(this, this.handleEvent,''),true);
		this.editor.contentDocument.addEventListener('dragstart',this.myBBComposerManager.newEventHandler(this, this.handleEvent,''),true);
		this.editor.contentDocument.addEventListener('dragenter',this.myBBComposerManager.newEventHandler(this, this.handleEvent,''),true);
		this.editor.contentDocument.addEventListener('dragover',this.myBBComposerManager.newEventHandler(this, this.handleEvent,''),true);
		this.editor.contentDocument.addEventListener('dragleave',this.myBBComposerManager.newEventHandler(this, this.handleEvent,''),true);
		this.editor.contentDocument.addEventListener('dragend',this.myBBComposerManager.newEventHandler(this, this.handleEvent,''),true);
		this.editor.contentDocument.addEventListener('drop',this.myBBComposerManager.newEventHandler(this, this.handleEvent,''),true);
		// Options
		if(this.myBBComposerManager.myBBComposerPreferences.getCharOption('site.css')!='none')
			{
			var style = this.editor.contentDocument.getElementsByTagName('link')[0];
			style.setAttribute('href', this.myBBComposerManager.myBBComposerPreferences.getCharOption('site.css'));
			}
		if(this.myBBComposerManager.myBBComposerPreferences.getCharOption('save.delay'))
			this.autoSaveTimeout = window.setTimeout(this.myBBComposerManager.newEventHandler(this, this.autoSave,''), this.myBBComposerManager.myBBComposerPreferences.getCharOption('save.delay'));
		// Start
		this.editor.contentDocument.designMode="on";
		this.myBBComposerManager.setFocusedBBComposer(this);
		if(this.myBBComposerManager.myBBComposerPreferences.getBoolOption('spellchecker'))
			{
			this.myBBComposerManager.enableSpellcheck();
			}
		// Contents
		this.setContent(this.originalContent);
		// Images
		var images = this.editor.contentDocument.getElementsByTagName('img');
		var x = images.length;
		for(var i=0; i<x; i++)
			{
			if(!/(http|ftp|chrome|file):\/\/(.+)/.test(images[i].getAttribute('src'))) {
				images[i].setAttribute('src', this.base + images[i].getAttribute('src')); }
			}
		// Focus
		this.setFocusedNode(this.getFirstBlockChild(this.rootElement,0));
		}

	bbcomposer.prototype.unInit = function (type)
		{
		if(this.autoSaveTimeout)
			window.clearTimeout(this.autoSaveTimeout);
		if(this.editor&&this.editor.contentDocument)
			{
			this.autoSave(true);
			var images = this.editor.contentDocument.getElementsByTagName('img');
			var x = images.length;
			var regExp = new RegExp(this.base + '(.+)');
			for(var i=0; i<x; i++)
				if(regExp.test(images[i].getAttribute('src')))
					images[i].setAttribute('src', images[i].getAttribute('src').replace(regExp, '$1'));
			}
		}

	bbcomposer.prototype.handleEvent = function (hEvent)
		{
		switch (hEvent.type)
			{
			case "click" :
			if(hEvent.ctrlKey)
				{
				if(hEvent.target.tagName&&(hEvent.target.tagName.toLowerCase()=="a"||hEvent.target.tagName.toLowerCase()=="img"))
					{
					hEvent.preventDefault(); hEvent.stopPropagation();
					this.setFocusedNode(hEvent.target);
					this.toggleDialogCommand(this.getSelectedElement());
					}
				else
					{
					var block=this.getParentBlock(hEvent.target);
					if(block)
						{
						this.doAction({actionFunction:this.setSelection, selectNode:block, traceMessage:'handleEvent 2'});
						hEvent.preventDefault(); hEvent.stopPropagation();
						}
					}
				}
			else if(hEvent.target.tagName&&(hEvent.target.tagName.toLowerCase()=="img"||hEvent.target.tagName.toLowerCase()=="hr"))
				{
				this.doAction({actionFunction:this.setSelection, selectNode:hEvent.target, traceMessage:'handleEvent 3'});
				hEvent.preventDefault(); hEvent.stopPropagation();
				}
			else if(hEvent.target.tagName&&hEvent.target.tagName.toLowerCase()=="a")
				{
				hEvent.preventDefault(); hEvent.stopPropagation();
				//this.setFocusedNode(hEvent.target);
				}
			else
				this.displayElementInfo();
			break;
			case "dblclick" :
			if(hEvent.target.tagName&&(hEvent.target.tagName.toLowerCase()=="img"||hEvent.target.tagName.toLowerCase()=="a"))
				{
				hEvent.preventDefault(); hEvent.stopPropagation(); hEvent.cancelBubble = true;
				this.doAction({actionFunction:this.setSelection, selectNode:hEvent.target, traceMessage:'handleEvent 4'});
				this.toggleDialogCommand(hEvent.target.tagName.toLowerCase());
				}
			break;
			case "drag" :
			hEvent.stopPropagation(); hEvent.preventDefault(); //hEvent.cancelBubble = true;
			break;
			case "dragstart" :
			case "dragover" :
			case "dragenter" :
			case "dragleave" :
			case "dragend" :
			//hEvent.stopPropagation(); hEvent.preventDefault(); //hEvent.cancelBubble = true;
			break;
			case "drop" :
			hEvent.stopPropagation(); hEvent.preventDefault(); //hEvent.cancelBubble = true;
			this.drop(hEvent);
			break;
			case "mouseover" :
			break;
			case "focus" :
			this.myBBComposerManager.setFocusedBBComposer(this);
			this.displayElementInfo();
			break;
			case "mouseup" :
			case "keypress" :
			if(hEvent.ctrlKey && hEvent.keyCode==38)
				{
				this.doAction({actionFunction:this.setSelection, selectNode:this.getPrecedentBlock(this.getSelectedBlock()), traceMessage:'handleEvent 5'});
				hEvent.stopPropagation(); hEvent.preventDefault();
				}
			else if(hEvent.ctrlKey && hEvent.keyCode==40)
				{
				this.doAction({actionFunction:this.setSelection, selectNode:this.getNextBlock(this.getSelectedBlock()), traceMessage:'handleEvent 6'});
				hEvent.stopPropagation(); hEvent.preventDefault();
				}
			else if(hEvent.keyCode==46)
				{
				hEvent.stopPropagation(); hEvent.preventDefault();
				this.doDelete();
				}
			else if(hEvent.keyCode==8)
				{
				hEvent.stopPropagation(); hEvent.preventDefault();
				this.doBackward();
				}
			else if(hEvent.keyCode==9)
				{
				hEvent.preventDefault(); hEvent.stopPropagation();
				if(!hEvent.shiftKey)
					{
					if(this.myBBComposerManager.buttonIsOnToolbar('indent'))
						{
						this.myBBComposerManager.ckeckToolbarButton('indent')
						}
					this.doIndentCommand();
					}
				else
					{
					if(this.myBBComposerManager.buttonIsOnToolbar('deindent'))
						{
						this.myBBComposerManager.ckeckToolbarButton('deindent')
						}
					this.doDeindentCommand();
					}
				}
			else if(hEvent.keyCode==13)
				{
				hEvent.preventDefault(); hEvent.stopPropagation();
				if(hEvent.shiftKey)
					{
					this.doNewLineCommand();
					}
				else if(!hEvent.ctrlKey)
					{
					this.doEnterCommand();
					}
				}
			else if(hEvent.charCode)
				{
				if(!hEvent.ctrlKey)
					{
					hEvent.preventDefault(); hEvent.stopPropagation();
					this.doWrite(hEvent.charCode);
					}
				else
					{
					if(hEvent.charCode=='v'.charCodeAt(0))
						{
						hEvent.preventDefault(); hEvent.stopPropagation();
						this.paste();
						}
					else if(hEvent.charCode=='c'.charCodeAt(0))
						{
						hEvent.preventDefault(); hEvent.stopPropagation();
						this.copy();
						}
					else if(hEvent.charCode=='x'.charCodeAt(0))
						{
						hEvent.preventDefault(); hEvent.stopPropagation();
						this.cut();
						}
					else if(hEvent.charCode=='z'.charCodeAt(0))
						{
						hEvent.preventDefault(); hEvent.stopPropagation();
						this.undoAction();
						}
					else if(hEvent.charCode=='y'.charCodeAt(0))
						{
						hEvent.preventDefault(); hEvent.stopPropagation();
						this.redoAction();
						}
					}
				}
			break;
			case "keydown" :
			//hEvent.stopPropagation(); hEvent.preventDefault();
			break;
			case "keyup" :
			if(hEvent.type=='keyup')
				this.displayElementInfo();
			break;
			default :
			alert("Unexpected event : " + hEvent.type + " at element : " + hEvent.target.tagName);
			return true;
			}
		return true;
		}


			/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
			   ELEMENT MANIPULATION : BEGIN
			@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

	bbcomposer.prototype.displayElementInfo = function ()
		{
		this.myBBComposerManager.updateUI();
		}

	//XXXXXXXXXXXXXXX SUPERBLOCKS ELEMENTS MANIPULATION XXXXXXXXXXXXXXX//

	bbcomposer.prototype.getSelectedSuperblock = function (selection)
		{
		return this.getParentSuperblock(this.getSelectedElement(selection));
		}

	bbcomposer.prototype.getParentSuperblock = function (node)
		{
		while(node&&node!=this.rootElement&&!this.elementIsSuperblock(node))
			{
			node=node.parentNode;
			}
		if(node&&node!=this.rootElement)
			return node;
		return null;
		}

	bbcomposer.prototype.elementIsSuperblock = function (testedElement)
		{
		var element = testedElement;
		if(element&&element!=this.rootElement&&this.checkMarkupType(element.nodeName,'superblock'))
			return true;
		while(element&&element.nodeName&&element.parentNode
			&&(this.checkMarkupType(element.nodeName,'superblock')
			||this.checkMarkupType(element.nodeName,'mixed'))
			&&element!=this.rootElement)
				element=element.parentNode;
		if(testedElement!=element&&element==this.rootElement)
			return true;
		return false;
		}

	//XXXXXXXXXXXXXXX BLOCKS ELEMENTS MANIPULATION XXXXXXXXXXXXXXX//

	bbcomposer.prototype.getFirstBlockChild = function (element)
		{
		while((this.elementIsSuperblock(element)||element==this.rootElement)&&element.firstChild)
			element = element.firstChild;
		if(this.elementIsBlock(element))
			return element;
		return null;
		}

	bbcomposer.prototype.getLastBlockChild = function (element)
		{
		while((this.elementIsSuperblock(element)||element==this.rootElement)&&element.lastChild)
			element = element.lastChild;
		if(this.elementIsBlock(element))
			return element;
		return null;
		}

	bbcomposer.prototype.getSelectedBlocks = function (selection)
		{
		if(!selection)
			selection=this.getSelection();
		var elements = new Array(this.getSelectedBlock(selection));
		if(elements[0]==null)
			{
			var firstBlock = this.getParentBlock(selection.startContainer);
			var lastBlock = this.getParentBlock(selection.endContainer);
			if(firstBlock==null||lastBlock==null)
				return null;
			else
				{
				elements[0] = firstBlock;
				while(firstBlock!=lastBlock)
					{
					firstBlock = this.getNextBlock(firstBlock);
					elements[elements.length] = firstBlock;
					}
				}
			}
		return elements;
		}

	bbcomposer.prototype.getPrecedentBlock = function (element)
		{
		while(element&&element!=this.rootElement&&element.parentNode)
			{
			if(element.previousSibling&&this.elementIsBlock(element.previousSibling))
				return element.previousSibling;
			else if(element.previousSibling&&this.elementIsSuperblock(element.previousSibling)&&this.getLastBlockChild(element.previousSibling))
				return this.getLastBlockChild(element.previousSibling);
			element=element.parentNode;
			}
		return this.getFirstBlockChild(this.rootElement.firstChild);
		}

	bbcomposer.prototype.getNextBlock = function (element)
		{
		while(element&&element!=this.rootElement&&element.parentNode)
			{
			if(element.nextSibling&&this.elementIsBlock(element.nextSibling))
				return element.nextSibling;
			else if(element.nextSibling&&this.elementIsSuperblock(element.nextSibling)&&this.getFirstBlockChild(element.nextSibling))
				return this.getFirstBlockChild(element.nextSibling);
			element=element.parentNode;
			}
		return this.getLastBlockChild(this.rootElement.lastChild);
		}

	bbcomposer.prototype.getSelectedBlock = function (selection)
		{
		return this.getParentBlock(this.getSelectedNode(selection));
		}

	bbcomposer.prototype.getParentBlock = function (element)
		{
		if(element)
			{
			while(element&&!this.elementIsBlock(element))
				{
				if(element==this.rootElement) { return null; }
				element=element.parentNode;
				}

			if(element)
				return element;
			}
		return null;
		}

	bbcomposer.prototype.elementHasParentBlock = function (element)
		{
		if(element)
			{
			while(element&&!this.elementIsBlock(element))
				{
				if(element==this.rootElement) { return false; }
				element=element.parentNode;
				}
			if(element)
				return true;
			}
		return false;
		}

	bbcomposer.prototype.elementIsBlock = function (element)
		{
		if(element&&this.checkMarkupType(element.nodeName,'block'))
			return true;
		else
			return false;
		}

	//XXXXXXXXXXXXXXX LISTITEMS ELEMENTS MANIPULATION XXXXXXXXXXXXXXX//

	bbcomposer.prototype.getNextListItem = function (element)
		{
		while(!element.nextSibling)
			{
			if(element.nextSibling&&this.nodeIsListItem(element.nextSibling))
				return element.nextSibling;
			else
				element=this.getParentListItem(element);
			}
		return null;
		}

	bbcomposer.prototype.getParentListItem = function (element)
		{
		if(element)
			{
			while(!this.nodeIsListItem(element))
				{
				if(element==this.rootElement) { return null; }
				element=element.parentNode;
				}
			return element;
			}
		return null;
		}

	bbcomposer.prototype.elementHasParentListItem = function (element)
		{
		if(element)
			{
			while(!this.nodeIsListItem(element))
				{
				if(element==this.rootElement) { return false; }
				element=element.parentNode;
				}
			return true;
			}
		return null;
		}

	bbcomposer.prototype.nodeIsListItem = function (element)
		{
		if(element&&this.checkMarkupType(element.nodeName,'list-item'))
			return true;
		else
			return false;
		}

	//XXXXXXXXXXXXXXX INLINE ELEMENTS MANIPULATION XXXXXXXXXXXXXXX//

	bbcomposer.prototype.getSelectedInline = function (selection)
		{
		var element=this.getSelectedElement(selection);
		while(!this.elementIsInline(element))
			{
			if(element==this.rootElement) { return null; }
			element=element.parentNode;
			}
		return element;
		}

	bbcomposer.prototype.elementIsInline = function (element)
		{
		if(element&&(!this.nodeIsTextnode(element))&&this.nodeIsInline(element))
			return true;
		else
			return false;
		}

	//XXXXXXXXXXXXXXX INLINE NODES MANIPULATION XXXXXXXXXXXXXXX//

	bbcomposer.prototype.getFirstInlineChildNode = function (node)
		{
		while(node&&(!this.nodeIsInline(node))&&node.firstChild)
			{
			node=node.firstChild;
			}
		if(this.nodeIsInline(node))
			return node;
		return null;
		}

	bbcomposer.prototype.getLastInlineChildNode = function (node)
		{
		while(node&&(!this.nodeIsInline(node))&&node.lastChild)
			{
			node=node.lastChild;
			}
		if(this.nodeIsInline(node))
			return node;
		return null;
		}

	bbcomposer.prototype.getFirstDeepestInlineChildNode = function (node)
		{
		node=this.getFirstInlineChildNode(node);
		while(node&&this.nodeIsInline(node)&&node.firstChild)
			{
			node=node.firstChild;
			}
		if(this.nodeIsInline(node))
			return node;
		return null;
		}

	bbcomposer.prototype.getLastDeepestInlineChildNode = function (node)
		{
		node=this.getLastInlineChildNode(node);
		while(node&&this.nodeIsInline(node)&&node.lastChild)
			{
			node=node.lastChild;
			}
		if(this.nodeIsInline(node))
			return node;
		return null;
		}

	bbcomposer.prototype.getPreviousSiblingInlineNode = function (node)
		{
		while(node&&node.previousSibling)
			{
			node=node.previousSibling;
			var lastInline=this.getLastInlineChildNode(node);
			if(lastInline)
				return lastInline;
			}
		return null;
		}

	bbcomposer.prototype.getNextSiblingInlineNode = function (node)
		{
		while(node&&node.nextSibling)
			{
			node=node.nextSibling;
			var firstInline=this.getFirstInlineChildNode(node);
			if(firstInline)
				return firstInline;
			}
		return null;
		}

	bbcomposer.prototype.getPreviousInlineNode = function (node)
		{
		while(node&&node.parentNode&&node!=this.rootElement)
			{
			var previousSiblingInlineNode = this.getPreviousSiblingInlineNode(node);
			if(previousSiblingInlineNode)
				return previousSiblingInlineNode;
			node=node.parentNode;
			}
		return null;
		}

	bbcomposer.prototype.getNextInlineNode = function (node)
		{
		while(node&&node.parentNode&&node!=this.rootElement)
			{
			var nextSiblingInlineNode = this.getNextSiblingInlineNode(node);
			if(nextSiblingInlineNode)
				return nextSiblingInlineNode;
			node=node.parentNode;
			}
		return null;
		}

	bbcomposer.prototype.getPreviousDeepestInlineNode = function (node)
		{
		return this.getLastDeepestInlineChildNode(this.getPreviousInlineNode(node));
		}

	bbcomposer.prototype.getNextDeepestInlineNode = function (node)
		{
		return this.getFirstDeepestInlineChildNode(this.getNextInlineNode(node));
		}

	bbcomposer.prototype.nodeIsInline = function (node)
		{
		if(node&&this.nodeIsTextnode(node))
			return true;
		else if(node&&this.checkMarkup(node.nodeName))
			{
			if(this.checkMarkupType(node.nodeName,'inline'))
				return true;
			else if(this.checkMarkupType(node.nodeName,'mixed'))
				{
				if(node.parentNode && this.elementIsBlock(node.parentNode))
					return true
				else if(this.nodeIsInline(node.parentNode))
					return true;
				}
			}
		return false;
		}

	bbcomposer.prototype.nodeIsEmpty = function (node)
		{
		while(node&&node.hasChildNodes()&&node.firstChild==node.lastChild)
			{
			node=node.firstChild;
			}
		if(this.nodeIsTextnode(node))
			{
			if((!node.textContent)||node.textContent=='\u00A0'||node.textContent=='&nbsp;'||node.textContent==' ')
				return true;
			else
				return false;
			}
		else if(node.childNodes.length==0&&this.checkFertility(node.nodeName))
			return true;
		return false;
		}

	//XXXXXXXXXXXXXXX INLINE CONTAINERS ELEMENTS MANIPULATION XXXXXXXXXXXXXXX//

	bbcomposer.prototype.getPrecedentInlineContainer = function (node)
		{
		while(node&&node.parentNode&&node!=this.rootElement&&!node.previousSibling)
			{
			node=node.parentNode;
			}
		if(node&&node!=this.rootElement&&node.previousSibling)
			{
			node=node.previousSibling;
			while(node&&node.lastChild&&(!this.nodeIsInline(node.lastChild))&&!this.nodeIsListItem(node))
				{
				node=node.lastChild;
				}
			return node;
			}
		return null;
		}

	bbcomposer.prototype.getNextInlineContainer = function (node)
		{
		while(node&&node.parentNode&&node!=this.rootElement&&!node.nextSibling)
			{
			node=node.parentNode;
			}
		if(node&&node!=this.rootElement&&node.nextSibling)
			{
			node=node.nextSibling;
			while(node&&node.firstChild&&(!this.nodeIsInline(node.firstChild))&&!this.nodeIsListItem(node))
				{
				node=node.firstChild;
				}
			return node;
			}
		return null;
		}

	bbcomposer.prototype.getLastInlineContainer = function (node)
		{
		if(node&&(this.elementIsBlock(node)||this.elementIsSuperblock(node)||node!=this.rootElement))
			{
			while(node&&node.lastChild&&(!this.nodeIsInline(node.lastChild))&&!this.nodeIsListItem(node))
				{
				node=node.lastChild;
				}
			if(node.lastChild&&this.nodeIsInline(node.lastChild))
				return node;
			}
		return null;
		}

	bbcomposer.prototype.getFirstInlineContainer = function (node)
		{
		if(node&&(this.elementIsBlock(node)||this.elementIsSuperblock(node)||node!=this.rootElement))
			{
			while(node&&node.firstChild&&(!this.nodeIsInline(node.firstChild))&&!this.nodeIsListItem(node)) //pifometre
				{
				node=node.firstChild;
				}
			if(node.firstChild&&this.nodeIsInline(node.firstChild))
				return node;
			}
		return null;
		}

	bbcomposer.prototype.getInlineContainer = function (node)
		{
		if(node&&(this.nodeIsInline(node)||this.nodeIsInlineContainer(node)))
			{
			while(node&&node.parentNode&&node!=this.rootElement&&this.nodeIsInline(node)&&!this.nodeIsListItem(node))
				{
				node=node.parentNode;
				}
			return node;
			}
		return null;
		}

	bbcomposer.prototype.nodeIsInlineContainer = function (node)
		{ //A revoir avec détection de block + list-items pour prise en compte de blocks vides
		if(node&&(!this.nodeIsInline(node))&&node.firstChild&&this.nodeIsInline(node.firstChild))
			return true;
		return false;
		}

	//XXXXXXXXXXXXXXX TEXTNODES MANIPULATION XXXXXXXXXXXXXXX//

	bbcomposer.prototype.getFirstChildTextnode = function (node)
		{
		if(!this.nodeIsTextnode(node))
			{
			while(node&&!this.nodeIsTextnode(node))
				{
				if(!node.firstChild)
					return null;
				node=node.firstChild;
				}
			}
		if(node)
			return node;
		return null;
		}

	bbcomposer.prototype.getLastChildTextnode = function (node)
		{
		if(!this.nodeIsTextnode(node))
			{
			while(node&&!this.nodeIsTextnode(node))
				{
				if(!node.lastChild)
					return null;
				node=node.lastChild;
				}
			}
		if(node)
			return node;
		return null;
		}

	bbcomposer.prototype.getNextTextnode = function (node)
		{
		if(node)
			node=this.getNextInlineNode(node);
		while(node&&!this.nodeIsTextnode(node))
			node=this.getNextInlineNode(node);
		if(node)
			return node;
		return null;
		}

	bbcomposer.prototype.getPreviousTextnode = function (node)
		{
		if(node)
			node=this.getPreviousInlineNode(node);
		while(node&&!this.nodeIsTextnode(node))
			node=this.getPreviousInlineNode(node);
		if(node)
			return node;
		return null;
		}

	bbcomposer.prototype.nodeIsTextnode = function (node)
		{
		if(node&&node.nodeName.toLowerCase()=='#text')
			return true;
		return false;
		}

	//XXXXXXXXXXXXXXX ELEMENTS SELECTION XXXXXXXXXXXXXXX//

	bbcomposer.prototype.getSelectedElement = function (selection)
		{
		var node = this.getSelectedNode(selection);
		if(node && node.nodeName)
			{
			while(node&&this.nodeIsTextnode(node))
				node=node.parentNode;
			return node;
			}
		return this.rootElement;
		}

	//XXXXXXXXXXXXXXX NODES SELECTION XXXXXXXXXXXXXXX//
	
	bbcomposer.prototype.getNextDeepestNode = function (node)
		{
		return this.getFirstDeepestChildNode(this.getNextNode(node));
		}

	bbcomposer.prototype.getFirstDeepestChildNode = function (node)
		{
		while(node&&node.firstChild)
			{
			node=node.firstChild;
			}
		return node;
		}

	bbcomposer.prototype.getNextNode = function (node)
		{
		while(node&&!node.nextSibling&&node.parentNode&&node!=this.rootElement)
			{
			node=node.parentNode;
			}
		if(node&&node.nextSibling&&node!=this.rootElement)
			return node.nextSibling;
		return null;
		}

	bbcomposer.prototype.getPreviousDeepestNode = function (node)
		{
		return this.getLastDeepestChildNode(this.getPreviousNode(node));
		}

	bbcomposer.prototype.getLastDeepestChildNode = function (node)
		{
		while(node&&node.lastChild)
			{
			node=node.lastChild;
			}
		return node;
		}

	bbcomposer.prototype.getPreviousNode = function (node)
		{
		while(node&&!node.previousSibling&&node.parentNode&&node!=this.rootElement)
			{
			node=node.parentNode;
			}
		if(node&&node.previousSibling&&node!=this.rootElement)
			return node.previousSibling;
		return null;
		}

	bbcomposer.prototype.getNodeDeep = function (node)
		{
		var i=0;
		while(node&&node!=this.rootElement)
			{
			node=node.parentNode;
			i++;
			}
		return i;
		}

	bbcomposer.prototype.setFocusedNode = function (node, offset)
		{
		var selection = this.getEditorSelection();
		selection.removeAllRanges();
		if(node)
			{
			var range = this.editor.contentDocument.createRange();
		/*	var lDICN=this.getLastDeepestInlineChildNode(node);
			if(lDICN)
				node=lDICN;*/
			if(this.nodeIsTextnode(node))
				{
				if((offset||offset===0))
					range.setStart(node,(offset>node.textContent.length?node.textContent.length:offset));
				else
					range.setStart(node,node.textContent.length);
				selection.addRange(range);
				}
			else
				{
				if(offset||offset===0)
					{
					range.setStart(node,offset);
					selection.addRange(range);
					selection.collapseToStart();
					}
				else if(node.firstChild&&node.lastChild)
					{
					range.setStartBefore(node.firstChild);
					range.setEndAfter(node.lastChild);
					selection.addRange(range);
					selection.collapseToEnd();
					}
				else
					{
					range.setStartBefore(node);
					range.setEndAfter(node);
					selection.addRange(range);
					selection.collapse(node,0);
					}
				}
			}
		}

	bbcomposer.prototype.setSelectedNode = function (node)
		{
		var selection = this.getEditorSelection();
		selection.removeAllRanges();
		if(node)
			{
			var range = this.editor.contentDocument.createRange();
			if(this.nodeIsTextnode(node))
				{
				range.setStart(node,0);
				range.setEnd(node,node.textContent.length);
				selection.addRange(range);
				}
			else
				{
				if(node.firstChild)
					{
					range.setStartBefore(node.firstChild);
					range.setEndAfter(node.lastChild);
					selection.addRange(range);
					}
				else
					{
					range.setStart(node,0);
					range.setEnd(node,0);
					selection.addRange(range);
					}
				}
			}
		}

	bbcomposer.prototype.getSelectedNode = function (selection)
		{
		if(!selection)
			selection = this.getSelection();
		if(selection)
			{
			if(selection.collapsed)
				return selection.focusNode;
			else
				{
				var node1 = selection.startContainer
				var nodelev1 = this.getNodeDeep(node1);
				var node2 = selection.endContainer;
				var nodelev2 = this.getNodeDeep(node2);
				for(nodelev1; nodelev1>nodelev2; nodelev1--)
					node1=node1.parentNode;
				for(nodelev2; nodelev2>nodelev1; nodelev2--)
					node2=node2.parentNode;
				while(node1!=node2)
					{
					node1=node1.parentNode;
					node2=node2.parentNode;
					}
				return node1;
				}
			return null;
			}
		}

	//XXXXXXXXXXXXXXX SELECTION XXXXXXXXXXXXXXX//

	bbcomposer.prototype.getEditorSelection = function ()
		{
		return this.editor.contentWindow.getSelection();
		}

	bbcomposer.prototype.getSelection = function (range)
		{
		if(!range)
			{
			var sel=this.editor.contentWindow.getSelection();
			if(sel&&sel.rangeCount>0)
				range=sel.getRangeAt(0);
			}
		if(range)
			{
			var selection = {};
			if(range.collapsed)
				{
				if(this.nodeIsTextnode(range.startContainer))
					{
					selection.focusNode=range.startContainer;
					selection.focusOffset=range.startOffset;
					}
				else
					{
					if(range.startContainer.hasChildNodes())
						{
						if(range.startOffset==range.startContainer.childNodes.length)
							{
							selection.focusNode=this.getFirstDeepestChildNode(range.startContainer.lastChild);
							}
						else
							{
							selection.focusNode=this.getFirstDeepestChildNode(range.startContainer.childNodes[range.startOffset]);
							}
						}
					else
						{
						selection.focusNode=this.getFirstDeepestChildNode(range.startContainer);
						}
					selection.focusOffset=0;
					}
				selection.collapsed=true;
				}
			else
				{
				if(this.nodeIsTextnode(range.startContainer))
					{
					if(range.startOffset>=range.startContainer.textContent.length)
						{
						selection.startContainer=this.getNextDeepestNode(range.startContainer);
						selection.startCollapseable=range.startContainer;
						selection.startOffset=0;
						}
					else
						{
						selection.startContainer=range.startContainer;
						selection.startOffset=range.startOffset;
						}
					}
				else
					{
					if(range.startContainer.hasChildNodes())
						{
						if(range.startOffset==range.startContainer.childNodes.length)
							{
							selection.startContainer=this.getNextDeepestNode(range.startContainer);
							selection.startCollapseable=range.startContainer;
							}
						else
							{
							selection.startContainer=this.getFirstDeepestChildNode(range.startContainer.childNodes[range.startOffset]);
							}
						}
					else
						{
						selection.startContainer=this.getFirstDeepestChildNode(range.startContainer);
						}
					selection.startOffset=0;
					}
				if(this.nodeIsTextnode(range.endContainer))
					{
					if(range.endOffset==0)
						{
						selection.endContainer=this.getPreviousDeepestNode(range.endContainer);
						selection.endCollapseable=range.endContainer;
						if(this.nodeIsTextnode(selection.endContainer))
							selection.endOffset=selection.endContainer.textContent.length;
						else
							selection.endOffset=0;
						}
					else
						{
						selection.endContainer=range.endContainer;
						selection.endOffset=range.endOffset;
						}
					}
				else 
					{
					if(range.endContainer.hasChildNodes())
						{
						if(range.endOffset>0)//<.length)
							{
							selection.endContainer=this.getLastDeepestChildNode(range.endContainer.childNodes[range.endOffset-1]);
							}
						else
							{
							selection.endContainer=this.getPreviousDeepestNode(range.endContainer);
							selection.endCollapseable=range.endContainer;
							}
						}
					else
						{
						selection.endContainer=this.getLastDeepestChildNode(range.endContainer);
						}
					if(this.nodeIsTextnode(selection.endContainer))
						selection.endOffset=selection.endContainer.textContent.length;
					else
						selection.endOffset=0;
					}
				selection.collapsed=false;
				if(selection.endContainer==this.rootElement)
					{
					alert('selection.endContainer cannot be the root element');
					}
				}
			if(selection.startContainer==this.rootElement)
				{
				alert('selection.startContainer cannot be the root element');
				}
			return selection;
			}
		return null;
		}

	bbcomposer.prototype.getImprovedSelection = function (selection)
		{
		if(!selection)
			selection = this.getSelection();
		if(selection&&!selection.collapsed)
			{
			selection.startContainerLevel=0;
			selection.endContainerLevel=0;
			var tNode=selection.startContainer;
			while(tNode!=this.rootElement)
				{
				selection.startContainerLevel++;
				tNode=tNode.parentNode;
				}
			var tNode=selection.endContainer;
			while(tNode!=this.rootElement)
				{
				selection.endContainerLevel++;
				tNode=tNode.parentNode;
				}

			var tNodeBefore=selection.startContainer;
			var tNodeBeforeLevel=selection.startContainerLevel;
			var tNodeAfter=selection.endContainer;
			var tNodeAfterLevel=selection.endContainerLevel;
			if(selection.startContainerLevel>selection.endContainerLevel)
				{
				while(tNodeBeforeLevel>selection.endContainerLevel)
					{
					tNodeBefore=tNodeBefore.parentNode;
					tNodeBeforeLevel--;
					}
				}
			else if(selection.startContainerLevel<selection.endContainerLevel)
				{
				while(tNodeAfterLevel>selection.startContainerLevel)
					{
					tNodeAfter=tNodeAfter.parentNode;
					tNodeAfterLevel--;
					}
				}

			while(tNodeBefore!=tNodeAfter)
				{
				tNodeBefore=tNodeBefore.parentNode;
				tNodeBeforeLevel--;
				tNodeAfter=tNodeAfter.parentNode;
				tNodeAfterLevel--;
				}

			selection.commonAncestor=tNodeBefore;
			selection.commonAncestorLevel=0;
			var tNode=selection.commonAncestor;
			while(tNode!=this.rootElement)
				{
				selection.commonAncestorLevel++;
				tNode=tNode.parentNode;
				}
			
			selection.endContainerLevel=selection.endContainerLevel-tNodeAfterLevel;
			selection.startContainerLevel=selection.startContainerLevel-tNodeAfterLevel;
			return selection;
			}
		return selection;
		}

	bbcomposer.prototype.removeSelection = function (selection)
		{
		var sel=this.editor.contentWindow.getSelection();
		sel.removeRange(sel.getRangeAt(0));
		}

	bbcomposer.prototype.cloneSelection = function (selection)
		{
		var range=this.editor.contentWindow.getSelection().getRangeAt(0);
		return range.cloneContents();
		}

	bbcomposer.prototype.displaySelection = function (selection)
		{
		if(!selection)
			selection = this.getSelection();
		if(selection)
			{
			if(selection.collapsed)
				alert('focuseNode: '+selection.focusNode.nodeName+' focusOffset: '+selection.focusOffset);
			else if(selection.startContainerLevel)
				alert('start'+selection.startContainer.nodeName+(this.nodeIsTextnode(selection.startContainer)?'('+selection.startContainer.textContent+')':'')+'#'+selection.startOffset+':'+selection.startContainerLevel+' end'+selection.endContainer.nodeName+(this.nodeIsTextnode(selection.endContainer)?'('+selection.endContainer.textContent+')':'')+'#'+selection.endOffset+':'+selection.endContainerLevel+' common'+this.getSelectedNode(selection).nodeName+':'+selection.commonAncestorLevel);
			else
				alert('start'+selection.startContainer.nodeName+'#'+selection.startOffset+' end'+selection.endContainer.nodeName+'#'+selection.endOffset+' common'+this.getSelectedNode(selection).nodeName);
			}
		}

	//XXXXXXXXXXXXXXX CARET XXXXXXXXXXXXXXX//

	bbcomposer.prototype.splitNodeAt = function (node, offset, root)
		{
		if(!root)
			root=this.rootElement;
		var leftNode;
		var rightNode;
		if(this.nodeIsTextnode(node))
			{
			if(offset===0)
				{
				rightNode=node;
				leftNode=this.getPreviousInlineNode(node);
				if((!leftNode)||leftNode.parentNode!=node.parentNode)
					{
					leftNode=this.editor.contentDocument.createTextNode('\u00A0');
					}
				this.doAction({actionFunction: this.insertElement, nextElement: node, theElement: leftNode, traceMessage:'splitNodeAt 1'});
				}
			else if(offset>=node.textContent.length)
				{
				leftNode=node;
				rightNode=this.getNextInlineNode(node);
				if((!rightNode)||rightNode.parentNode!=node.parentNode)
					{
					rightNode=this.editor.contentDocument.createTextNode('\u00A0');
					}
				this.doAction({actionFunction: this.insertElement, previousElement: node, theElement: rightNode, traceMessage:'splitNodeAt 2'});
				}
			else
				{
				rightNode = this.editor.contentDocument.createTextNode(node.textContent.substring(offset,node.textContent.length));
				leftNode=node;
				this.doAction({actionFunction: this.deleteTextInTextnode, textNode: node, curOffset: offset, delLength: node.textContent.length-offset, traceMessage:'splitNodeAt 3'});
				this.doAction({actionFunction: this.insertElement, previousElement: leftNode, theElement: rightNode, traceMessage:'splitNodeAt 4'});
				}
			}
		else
			{
			if(!node.hasChildNodes())
				{
				for(var i=node.childNodes.length-1; i>=0; i--)
					{
					if(node.parentNode==root)
						return;
					else if(node.parentNode.childNodes[i]==node)
						{
						offset=i;
						node=node.parentNode;
						break;
						}
					}
				}
			newNode = this.editor.contentDocument.createElement(node.nodeName);
			if(offset===0)
				{
				newNode.appendChild(this.editor.contentDocument.createTextNode('\u00A0'));
				leftNode=newNode;
				rightNode=node;
				this.doAction({actionFunction: this.insertElement, nextElement: node, theElement: newNode, traceMessage:'splitNodeAt 5'});
				}
			else
				{
				leftNode=node
				rightNode=newNode
				if(offset>=node.childNodes.length)
					{
					newNode.appendChild(this.editor.contentDocument.createTextNode('\u00A0'));
					}
				else
					{
					this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement:node, targetElement:newNode, startAfter:node.childNodes[offset-1], traceMessage:'splitNodeAt 6'});
					}
				this.doAction({actionFunction: this.insertElement, previousElement: node, theElement: newNode, traceMessage:'splitNodeAt 7'});
				}
			}
		while(leftNode.parentNode&&leftNode.parentNode!=root)
			{
			rightNode=this.editor.contentDocument.createElement(leftNode.parentNode.nodeName);
			this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement:leftNode.parentNode, targetElement:rightNode, startAfter:leftNode, traceMessage:'splitNodeAt 8'});
			leftNode=leftNode.parentNode;
			this.doAction({actionFunction: this.insertElement, previousElement: leftNode, theElement: rightNode, traceMessage:'splitNodeAt 9'});
			}
		this.doAction({actionFunction: this.doEmptyAction, focusNode: leftNode, traceMessage:'splitNodeAt 10'});
		}

	bbcomposer.prototype.splitAtCaretPosition = function (blockLevel)
		{
		var selection = this.getSelection();
		if(selection&&selection.collapsed)
			{
			if(!blockLevel)
				{
				var block = this.getParentBlock(selection.focusNode);
				var listItem = this.getParentListItem(selection.focusNode);
				this.splitNodeAt(selection.focusNode, selection.focusOffset, (listItem?listItem.parentNode:block.parentNode));
				}
			else
				{
				this.splitNodeAt(selection.focusNode, selection.focusOffset, this.getParentSuperblock(selection.focusNode));
				}
			}
		}

	bbcomposer.prototype.isLastUnemptyNode = function (node)
		{
		while(node&&node.nextSibling)
			{
			node=node.nextSibling;
			if(!this.nodeIsEmpty(node))
				return false
			}
		if(node)
			return true;
		return false;
		}

	bbcomposer.prototype.isFirstUnemptyNode = function (node)
		{
		while(node&&node.previousSibling)
			{
			node=node.previousSibling;
			if(!this.nodeIsEmpty(node))
				return false
			}
		if(node)
			return true;
		return false;
		}

	bbcomposer.prototype.caretIsAtEndOfBlock = function (countEmptyNodes)
		{
		if(this.caretIsAtEndOfInlineContainer(countEmptyNodes))
			{
			var inlineContainer=this.getInlineContainer(this.getSelectedNode());
			if(inlineContainer&&(this.elementIsBlock(inlineContainer)||this.getParentBlock(inlineContainer).lastChild==inlineContainer))
				{
				return true;
				}
			}
		return false;
		}

	bbcomposer.prototype.caretIsAtBeginOfBlock = function (countEmptyNodes)
		{
		if(this.caretIsAtBeginOfInlineContainer(countEmptyNodes))
			{
			var inlineContainer=this.getInlineContainer(this.getSelectedNode());
			if(inlineContainer&&(this.elementIsBlock(inlineContainer)||this.getParentBlock(inlineContainer).firstChild==inlineContainer))
				{
				return true;
				}
			}
		return false;
		}

	bbcomposer.prototype.caretIsAtEndOfInlineContainer = function (countEmptyNodes)
		{
		var selection = this.getSelection();
		if(selection&&selection.collapsed)
			{
			var node=selection.focusNode;
			var offset=selection.focusOffset;
			var inlineContainer=this.getInlineContainer(node);
			if((!this.nodeIsTextnode(node))&&node.hasChildNodes()&&offset<node.childNodes.length)
				{
				node=node.childNodes[offset];
				offset=0;
				if(countEmptyNodes||!this.nodeIsEmpty(node))
					{ return false; }
				}
			if((countEmptyNodes||!this.nodeIsEmpty(node))&&this.nodeIsTextnode(node))
				{
				if(offset<node.textContent.length)
					{ return false; }
				}
			var nextInlineNode=this.getNextInlineNode(node);
			while((!countEmptyNodes)&&nextInlineNode&&this.nodeIsEmpty(nextInlineNode)&&this.getInlineContainer(nextInlineNode)==inlineContainer)
				{
				nextInlineNode=this.getNextInlineNode(nextInlineNode);
				}
			if((!nextInlineNode)||(this.getInlineContainer(nextInlineNode)!=inlineContainer))
				{ return true; }
			}
		return false;
		}

	bbcomposer.prototype.caretIsAtBeginOfInlineContainer = function (countEmptyNodes)
		{
		var selection = this.getSelection();
		if(selection&&selection.collapsed)
			{
			var node=selection.focusNode;
			var offset=selection.focusOffset;
			var inlineContainer=this.getInlineContainer(node);
			if((!this.nodeIsTextnode(node))&&node.hasChildNodes()&&offset>0)
				{
				node=node.childNodes[offset];
				offset=0;
				if(countEmptyNodes||!this.nodeIsEmpty(node))
					{ return false; }
				}
			if((countEmptyNodes||!this.nodeIsEmpty(node))&&this.nodeIsTextnode(node))
				{
				if(offset>0)
					{ return false; }
				}
			var previousInlineNode=this.getPreviousInlineNode(node);
			while((!countEmptyNodes)&&previousInlineNode&&this.nodeIsEmpty(previousInlineNode)&&this.getInlineContainer(previousInlineNode)==inlineContainer)
				{
				previousInlineNode=this.getPreviousInlineNode(previousInlineNode);
				}
			if((!previousInlineNode)||(this.getInlineContainer(previousInlineNode)!=inlineContainer))
				{ return true; }
			}
		return false;
		}

	bbcomposer.prototype.isAtBeginOf = function (element, parent, countEmptyNodes)
		{
		while(element!=parent&&element!=this.rootElement)
			{
			if(element.parentNode.firstChild==element||((!countEmptyNodes)&&this.isFirstUnemptyNode(element)))
				element=element.parentNode;
			else
				return false;
			}
		if(element==parent)
			return true;
		}

	bbcomposer.prototype.isAtEndOf = function (element, parent, countEmptyNodes)
		{
		while(element!=parent&&element!=this.rootElement)
			{
			if(element.parentNode.lastChild==element||((!countEmptyNodes)&&this.isLastUnemptyNode(element)))
				element=element.parentNode;
			else
				return false;
			}
		if(element==parent)
			return true;
		}

	bbcomposer.prototype.collapseNodes = function (startNode, endNode)
		{
		var sNodeLevel= 0;
		var eNodeLevel= 0;
		var nodeWalker = startNode;
		while(nodeWalker.parentNode&&nodeWalker!=this.rootElement)
			{
			nodeWalker=nodeWalker.parentNode; sNodeLevel++;
			}
		var nodeWalker = endNode;
		while(nodeWalker.parentNode&&nodeWalker!=this.rootElement)
			{
			nodeWalker=nodeWalker.parentNode; eNodeLevel++;
			}

		if(eNodeLevel==sNodeLevel)
			{
			while(startNode&&endNode&&startNode!=endNode
				&&startNode.nodeName==endNode.nodeName)
				{
				
				}
			if(startNode.lastChild&&endNode.firstChild
				&&startNode.lastChild.nodeName==endNode.firstChild.nodeName)
				{
				if(startNode.lastChild.lastChild&&endNode.firstChild.firstChild)
					{
					var newStartNode = startNode.lastChild.lastChild;
					var newEndNode = endNode.firstChild.firstChild;
					}
				endNode.parent.removeChild(endNode);
				while(endNode.firstChild)
					startNode.appendChild(endNode.firstChild);
				if(newStartNode)
					this.collapseNodes(newStartNode, newEndNode);
				}
			}
		}

			/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
			   ELEMENT MANIPULATION : END
			@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

			/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
			  EDITOR COMMANDS INTERFACOR : BEGIN
			@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

	bbcomposer.prototype.canUseCommand = function (commandName)
		{
		var commandParams=this.getCommandParams(commandName);
		if(commandParams&&this['canUse'+commandParams[0][0].toUpperCase()+commandParams[0].substring(1)+'Command'])
			{
			return this['canUse'+commandParams[0][0].toUpperCase()+commandParams[0].substring(1)+'Command'](commandParams);
			}
		else
			return false;
		}

	bbcomposer.prototype.commandIsOn = function (commandName)
		{
		var element = this.getSelectedElement();
		var commandParams=this.getCommandParams(commandName);
		if(commandParams&&this[commandParams[0]+'CommandIsOn'])
			{
			return this[commandParams[0]+'CommandIsOn'](commandParams, element);
			}
		else
			return false;
		}

	bbcomposer.prototype.useCommand = function (commandName)
		{
		var commandParams=this.getCommandParams(commandName);
		if(commandParams&&this['do'+commandParams[0][0].toUpperCase()+commandParams[0].substring(1)+'Command'])
			{
			this['do'+commandParams[0][0].toUpperCase()+commandParams[0].substring(1)+'Command']((commandParams[1]?commandParams[1]:null),(commandParams[2]?commandParams[2]:null),(commandParams[3]?commandParams[3]:null));
			}
		}

	bbcomposer.prototype.getCommandParams = function (commandName)
		{
		if(/^bbcomposer\-(.*)\-command$/.test(commandName))
			{
			return commandName.replace(/bbcomposer\-(.*)\-command/,'$1').split('-');
			}
		return false;
		}

			/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
			   EDITOR COMMANDS INTERFACOR : END
			@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

			/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
			  EDITOR COMMANDS : BEGIN
			@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

	bbcomposer.prototype.deleteSelectionCommandIsOn = function ()
		{
		var selection = this.getSelection();
		if(selection&&!selection.collapsed)
			return true;
		return false;
		}

	bbcomposer.prototype.canUseDeleteSelectionCommand = bbcomposer.prototype.deleteSelectionCommandIsOn;

	bbcomposer.prototype.doDeleteSelectionCommand = function (preferFocusAfterNode,deleteEmptyTextNode)
		{
		var selection = this.getSelection();
		var focusedNode;
		if(selection&&!selection.collapsed)
			{
			var focusedNodeBefore; var focusedNodeAfter;
			var focusedOffsetBefore; var focusedOffsetAfter;
			var nodesToDelete=this.doSeparateSelectionCommand(selection);
			focusedNodeBefore=this.getPreviousDeepestNode(nodesToDelete[0]);
			if(this.nodeIsTextnode(focusedNodeBefore))
				focusedOffsetBefore=focusedNodeBefore.textContent.length;
			else
				focusedOffsetBefore=0;
			focusedNodeAfter=this.getNextDeepestNode(nodesToDelete[nodesToDelete.length-1]);
			focusedOffsetAfter=0;
			for(var i=nodesToDelete.length-1; i>=0; i--)
				{
				this.doAction({actionFunction: this.deleteElement, theElement: nodesToDelete[i], traceMessage:'doDeleteSelectionCommand 1'});
				}
			if(focusedNodeBefore&&((!preferFocusAfterNode)||!focusedNodeAfter))
				{ focusedNode=focusedNodeBefore; focusedOffset=focusedOffsetBefore; }
			else if(focusedNodeAfter)
				{ focusedNode=focusedNodeAfter; focusedOffset=focusedOffsetAfter; }
			if(!focusedNode)
				{
				focusedNode = this.editor.contentDocument.createElement('p')
				focusedNode.appendChild(this.editor.contentDocument.createTextNode('\u00A0'));
				this.doAction({actionFunction: this.insertElement, theElement: focusedNode, parentElement: this.rootElement, traceMessage:'doDeleteSelectionCommand 2'});
				}
			else
				{
				this.doAction({actionFunction: this.doEmptyAction, focusNode: focusedNode, focusOffset: focusedOffset, traceMessage:'doDeleteSelectionCommand 6'});
				}
			}
		}

	bbcomposer.prototype.doSeparateSelectionCommand = function (selection)
		{
		selection = this.getImprovedSelection(selection);
		var separatedNodes=[];
		var startNode;
		var startNodeLevel=selection.startContainerLevel;
		var endNode;
		var endNodeLevel=selection.endContainerLevel;
		// Cutting textNodes
		if(selection&&!selection.collapsed)
			{
			this.removeSelection();
			if(selection.startContainer!=selection.endContainer)
				{
				if((this.nodeIsTextnode(selection.startContainer))&&(selection.startOffset>0))
					{
					startNode=this.editor.contentDocument.createTextNode(selection.startContainer.textContent.substring(selection.startOffset,selection.startContainer.textContent.length));
					this.doAction({actionFunction: this.deleteTextInTextnode, textNode: selection.startContainer, curOffset: selection.startOffset, delLength: selection.startContainer.textContent.length-selection.startOffset, traceMessage:'doSeparateSelectionCommand 1'});
					this.doAction({actionFunction: this.insertElement, previousElement: selection.startContainer, theElement:startNode, traceMessage:'doSeparateSelectionCommand 2'});
					}
				else
					{
					startNode=selection.startContainer;
					}
				if(this.nodeIsTextnode(selection.endContainer)&&selection.endOffset<selection.endContainer.textContent.length)
					{
					endNode=this.editor.contentDocument.createTextNode(selection.endContainer.textContent.substring(0,selection.endOffset));
					this.doAction({actionFunction: this.deleteTextInTextnode, textNode: selection.endContainer, curOffset: 0, delLength: selection.endOffset, traceMessage:'doSeparateSelectionCommand 3'});
					this.doAction({actionFunction: this.insertElement, nextElement: selection.endContainer, theElement:endNode, traceMessage:'doSeparateSelectionCommand 4'});
					}
				else
					{
					endNode=selection.endContainer;
					}
				}
			else
				{
				startNode=endNode=selection.startContainer;
				var beforeNode, afterNode;
				if(this.nodeIsTextnode(selection.startContainer))
					{
					if(selection.endOffset<selection.endContainer.textContent.length)
						{
						afterNode=this.editor.contentDocument.createTextNode(selection.startContainer.textContent.substring(selection.endOffset));
						}
					if(selection.startOffset>0)
						beforeNode=this.editor.contentDocument.createTextNode(selection.startContainer.textContent.substring(0,selection.startOffset));
					if(afterNode)
						{
						this.doAction({actionFunction: this.deleteTextInTextnode, textNode: selection.endContainer, curOffset: selection.endOffset, delLength: selection.startContainer.textContent.length-selection.endOffset, traceMessage:'doSeparateSelectionCommand 5'});
						this.doAction({actionFunction: this.insertElement, previousElement: selection.endContainer, theElement:afterNode, traceMessage:'doSeparateSelectionCommand 6'});
						}
					if(beforeNode)
						{
						this.doAction({actionFunction: this.deleteTextInTextnode, textNode: selection.endContainer, curOffset: 0, delLength: selection.startOffset, traceMessage:'doSeparateSelectionCommand 7'});
						this.doAction({actionFunction: this.insertElement, nextElement: selection.endContainer, theElement:beforeNode, traceMessage:'doSeparateSelectionCommand 8'});
						}
					}
				}
			// Separating elements
			while(startNodeLevel>1||endNodeLevel>1)
				{
				if(startNodeLevel>=endNodeLevel)
					{
					if(startNode.previousSibling)
						{
						var newStartNode=this.editor.contentDocument.createElement(startNode.parentNode.nodeName);
						this.doAction({actionFunction: this.insertElement, previousElement: startNode.parentNode, theElement:newStartNode, traceMessage:'doSeparateSelectionCommand 9'});
						this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: startNode.parentNode, targetElement:newStartNode, startAfter:startNode.previousSibling, traceMessage:'doSeparateSelectionCommand 10'});
						startNode=newStartNode;
						//alert(1+' '+startNode.nodeName+' '+startNodeLevel);
						}
					else
						{
						startNode=startNode.parentNode;
						//alert(2+' '+startNode.nodeName+' '+startNodeLevel);
						}
					startNodeLevel--;
					}
				if(endNodeLevel>startNodeLevel)
					{
					if(endNode.nextSibling)
						{
						var newEndNode=this.editor.contentDocument.createElement(endNode.parentNode.nodeName);
						this.doAction({actionFunction: this.insertElement, nextElement: endNode.parentNode, theElement:newEndNode, traceMessage:'doSeparateSelectionCommand 11'});
						this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: endNode.parentNode, targetElement:newEndNode, stopAfter:endNode, traceMessage:'doSeparateSelectionCommand 12'});
						endNode=newEndNode;
						//alert(3+' '+endNode.nodeName+' '+endNodeLevel);
						}
					else
						{
						endNode=endNode.parentNode;
						//alert(4+' '+endNode.nodeName+' '+endNodeLevel);
						}
					endNodeLevel--;
					}
				}
			// Listing separated nodes
			if(endNode!=startNode)
				{
				//alert(5+' '+startNode.nodeName+' '+endNode.nodeName+' '+(startNode.parentNode==endNode.parentNode?'yep':'no'));
				var beginPush=false;
				for(var i=0; i<startNode.parentNode.childNodes.length; i++)
					{
					if(startNode.parentNode.childNodes[i]==startNode)
						beginPush=true;
					if(beginPush)
						{
						//alert('push'+startNode.parentNode.childNodes[i].nodeName);
						separatedNodes.push(startNode.parentNode.childNodes[i]);
						}
					if(startNode.parentNode.childNodes[i]==endNode)
						break;
					}
				}
			else
				{
				//alert(6);
				separatedNodes.push(endNode);
				}
			//alert('snLength'+separatedNodes.length);
			return separatedNodes;
			}
		}

	bbcomposer.prototype.doWrite = function (typedChar)
		{
		var selection = this.getSelection();
		if(selection&&selection.collapsed)
			{
			var node = selection.focusNode;
			var offset = selection.focusOffset;
			if(this.nodeIsTextnode(node))
				{
				this.doAction({actionFunction: this.addTextInTextnode, textNode: node, curOffset: offset, theText:String.fromCharCode(typedChar) , focusNode:node, focusOffset:offset+1, traceMessage:'doWrite 1'});
				}
			else if(this.nodeIsInline(node)||this.nodeIsInlineContainer(node))
				{
				if(node.hasChildNodes())
					{
					if(offset===0&&this.nodeIsTextnode(node.lastChild))
						{ // Firstchild ?
						this.setFocusedNode(node.lastChild,0);
						this.doWrite(typedChar);
						}
					else if(node.childNodes[offset-1]&&this.nodeIsTextnode(node.childNodes[offset-1]))
						{
						this.setFocusedNode(node.childNodes[offset-1],node.childNodes[offset-1].textContent.length);
						this.doWrite(typedChar);
						}
					else if(offset>0&&node.childNodes[offset]&&this.nodeIsTextnode(node.childNodes[offset]))
						{
						this.setFocusedNode(node.childNodes[offset],0);
						this.doWrite(typedChar);
						}
					else
						{
						var newTextNode = this.editor.contentDocument.createTextNode(String.fromCharCode(typedChar));
						if(offset<node.childNodes.length)
							{
							this.doAction({actionFunction: this.insertElement, nextElement: node.childNodes[offset], theElement: newTextNode, focusNode:newTextNode, focusOffset:1, traceMessage:'doWrite 2'});
							}
						else
							{
							this.doAction({actionFunction: this.insertElement, parentElement: node, theElement:newTextNode, focusNode:newTextNode, focusOffset:1, traceMessage:'doWrite 3'});
							}
						}
					}
				else // Should add generic element verification to test if they can contain text
					{
					var newTextNode = this.editor.contentDocument.createTextNode(String.fromCharCode(typedChar));
					if(node.nodeName.toLowerCase('img')||node.nodeName.toLowerCase('br'))
						this.doAction({actionFunction: this.insertElement, nextElement: node, theElement: newTextNode, focusNode:newTextNode, focusOffset:1, traceMessage:'doWrite 4'});
					else
						this.doAction({actionFunction: this.insertElement, parentElement: node, theElement: newTextNode, focusNode:newTextNode, focusOffset:1, traceMessage:'doWrite 4'});
					}
				}
			else if(this.getParentBlock(node)||this.getParentSuperblock(node))
				{
				var newBlock=this.editor.contentDocument.createElement('p');
				var newTextNode = this.editor.contentDocument.createTextNode(String.fromCharCode(typedChar));
				newBlock.appendChild(newTextNode);
				if(this.getParentBlock(node))
					{
					this.doAction({actionFunction: this.insertElement, previousElement: this.getParentBlock(node), theElement: newBlock, focusNode:newTextNode, focusOffset:1, traceMessage:'doWrite 5'});
					}
				else
					{
					this.doAction({actionFunction: this.insertElement, parentElement: this.getParentSuperblock(node), theElement: newBlock, focusNode:newTextNode, focusOffset:1, traceMessage:'doWrite 6'});
					}
				}
			else
				{
				var newBlock=this.getFirstBlockChild(this.rootElement.firstChild);
				if(!newBlock)
					{
					newBlock=this.editor.contentDocument.createElement('p');
					var newTextNode = this.editor.contentDocument.createTextNode(String.fromCharCode(typedChar));
					newBlock.appendChild(newTextNode);
					this.doAction({actionFunction: this.insertElement, parentElement: this.rootElement, theElement: newBlock, focusNode: newTextNode, focusOffset:1, traceMessage:'doWrite 7'});
					}
				else
					{
					var lastInlineChildNode=this.getLastInlineChildNode(newBlock);
					if(!this.nodeIsTextnode(lastInlineChildNode))
						{
						var newTextNode = this.editor.contentDocument.createTextNode(String.fromCharCode(typedChar));
						this.doAction({actionFunction: this.insertElement, parentElement: newBlock, theElement: newTextNode, focusNode: newTextNode, focusOffset:1, traceMessage:'doWrite 8'});
						}
					else
						{
						this.doAction({actionFunction: this.addTextInTextnode, textNode: lastInlineChildNode, theText:String.fromCharCode(typedChar) , focusNode:lastInlineChildNode, focusOffset:lastInlineChildNode.textContent.length+1, traceMessage:'doWrite 9'});
						}
					}
				}
			}
		else
			{
			this.doDeleteSelectionCommand(); this.doWrite(typedChar);
			}
		}

	bbcomposer.prototype.doBlockNewLineCommand = function ()
		{ // Some things should be improved (br deletion with empty nodes around).
		var selection = this.getSelection();
		var block=this.getSelectedBlock(selection);
		if(selection&&selection.collapsed)
			{
			var node = selection.focusNode;
			var offset = selection.focusOffset;
			if(node.hasChildNodes()&&offset<node.childNodes.length)
				{
				node=node.childNodes[offset];
				offset=0;
				}
			var previousInlineNode=this.getPreviousInlineNode(node);
			if(this.getParentBlock(node)!=this.getParentBlock(previousInlineNode))
				previousInlineNode=null;
			var nextInlineNode=this.getNextInlineNode(node);
			if(this.getParentBlock(node)!=this.getParentBlock(nextInlineNode))
				nextInlineNode=null;
				
			if(node&&(
				((this.nodeIsEmpty(node)||(this.nodeIsTextnode(node)&&(selection.focusOffset===0||selection.focusOffset>node.textContent.length)))
				&&(
					(offset>0&&nextInlineNode&&nextInlineNode.nodeName.toLowerCase()=='br')
					||(offset===0&&previousInlineNode&&previousInlineNode.nodeName.toLowerCase()=='br')))
				||node.nodeName.toLowerCase()=='br'))
				{
				if(node.nodeName.toLowerCase()=='br')
					var theBr=node;
				else if(offset===0&&previousInlineNode&&previousInlineNode.nodeName.toLowerCase()=='br')
					var theBr=node.previousSibling;
				else if(offset>0&&nextInlineNode&&nextInlineNode.nodeName.toLowerCase()=='br')
					var theBr=node.nextSibling;
				if(this.caretIsAtEndOfInlineContainer())
					{
					var newBlock = this.editor.contentDocument.createElement('p');
					newBlock.textContent='\u00A0';
					this.doAction({actionFunction: this.removeElement, theElement: theBr, traceMessage:'doBlockNewLineCommand 1'});
					this.doAction({actionFunction: this.insertElement, previousElement: block, theElement: newBlock, focusNode: newBlock, traceMessage:'doBlockNewLineCommand 2'});
					}
				else if(this.caretIsAtBeginOfInlineContainer())
					{
					var newBlock = this.editor.contentDocument.createElement('p');
					newBlock.textContent='\u00A0';
					this.doAction({actionFunction: this.removeElement, theElement: theBr, traceMessage:'doBlockNewLineCommand 3'});
					this.doAction({actionFunction: this.insertElement, previousElement: block, theElement: newBlock, focusNode: newBlock, traceMessage:'doBlockNewLineCommand 4'});
					}
				else
					{
					this.doAction({actionFunction: this.removeElement, theElement: theBr, traceMessage:'doBlockNewLineCommand 5'});
					this.splitAtCaretPosition();
					}
				}
			else
				{
				var newBr = this.editor.contentDocument.createElement('br');
				if(this.nodeIsTextnode(node)&&offset!==0&&offset<node.textContent.length)
					{
					if(nextInlineNode&&this.nodeIsTextnode(nextInlineNode))
						{
						this.doAction({actionFunction: this.addTextInTextnode, textNode: nextInlineNode, curOffset: 0, theText: node.textContent.substring(offset,node.textContent.length), traceMessage:'doBlockNewLineCommand 6'});
						this.doAction({actionFunction: this.deleteTextInTextnode, textNode: node, curOffset: offset, delLength: node.textContent.length-(offset-1), traceMessage:'doBlockNewLineCommand 7'});
						this.doAction({actionFunction: this.insertElement, previousElement: node, theElement: newBr, focusNode: nextInlineNode, focusOffset:0, traceMessage:'doBlockNewLineCommand 8'});
						}
					else if(previousInlineNode&&this.nodeIsTextnode(previousInlineNode))
						{
						this.doAction({actionFunction: this.addTextInTextnode, textNode: previousInlineNode, theText: node.textContent.substring(0,offset-1), traceMessage:'doBlockNewLineCommand 9'});
						this.doAction({actionFunction: this.deleteTextInTextnode, textNode: node, curOffset: offset, delLength: node.textContent.length-(offset-1), traceMessage:'doBlockNewLineCommand 10'});
						this.doAction({actionFunction: this.insertElement, previousElement: previousInlineNode, theElement: newBr, focusNode: node, focusOffset:0, traceMessage:'doBlockNewLineCommand 11'});
						}
					else
						{
						var newTextNode=this.editor.contentDocument.createTextNode(node.textContent.substring(offset,node.textContent.length));
						this.doAction({actionFunction: this.deleteTextInTextnode, textNode: node, curOffset: offset, delLength: node.textContent.length-(offset-1), traceMessage:'doBlockNewLineCommand 12'});
						this.doAction({actionFunction: this.insertElement, previousElement: node, theElement: newBr, traceMessage:'doBlockNewLineCommand 13'});
						this.doAction({actionFunction: this.insertElement, previousElement: newBr, theElement: newTextNode, focusNode: newTextNode, focusOffset:0, traceMessage:'doBlockNewLineCommand 14'});
						}
					}
				else
					{
					var newTextNode = this.editor.contentDocument.createTextNode('\u00A0');
					if(offset===0)
						{
						this.doAction({actionFunction: this.insertElement, nextElement: node, theElement: newBr, traceMessage:'doBlockNewLineCommand 15'});
						this.doAction({actionFunction: this.insertElement, nextElement: newBr, theElement: newTextNode, focusNode: newTextNode, focusOffset:0, traceMessage:'doBlockNewLineCommand 16'});
						}
					else
						{
						this.doAction({actionFunction: this.insertElement, previousElement: node, theElement: newBr, traceMessage:'doBlockNewLineCommand 17'});
						this.doAction({actionFunction: this.insertElement, previousElement: newBr, theElement: newTextNode, focusNode: newTextNode, focusOffset:0, traceMessage:'doBlockNewLineCommand 18'});
						}
					}
				}
			}
		}

	bbcomposer.prototype.doBlockEnterCommand = function ()
		{
		var selection = this.getSelection();
		var block=this.getSelectedBlock(selection);
		if(selection&&selection.collapsed)
			{
			if(this.nodeIsEmpty(block))
				{
				var superblock=this.getParentSuperblock(block);
				if(superblock)
					{
					if(superblock.lastChild==superblock.firstChild)
						{
						this.doAction({actionFunction: this.removeElement, theElement:superblock, focusNode:block, traceMessage:'doBlockEnterCommand 1'});
						}
					else if(superblock.lastChild==block)
						{
						this.doAction({actionFunction: this.removeElement, theElement:block, traceMessage:'doBlockEnterCommand 2'});
						this.doAction({actionFunction: this.insertElement, theElement:block, previousElement: superblock, focusNode: block, traceMessage:'doBlockEnterCommand 3'});
						}
					else if(superblock.firstChild==block)
						{
						this.doAction({actionFunction: this.removeElement, theElement:block, traceMessage:'doBlockEnterCommand 4'});
						this.doAction({actionFunction: this.insertElement, theElement:block, nextElement: superblock, focusNode: block, traceMessage:'doBlockEnterCommand 5'});
						}
					else
						{
						var newSuperblock=this.editor.contentDocument.createElement(superblock.nodeName);
						this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement:superblock, targetElement:newSuperblock, startAfter:block, traceMessage:'doBlockEnterCommand 6'});
						this.doAction({actionFunction: this.removeElement, theElement:block, traceMessage:'doBlockEnterCommand 7'});
						this.doAction({actionFunction: this.insertElement, theElement:newSuperblock, previousElement: superblock, traceMessage:'doBlockEnterCommand 8'});
						this.doAction({actionFunction: this.insertElement, theElement:block, previousElement: superblock, focusNode:block, traceMessage:'doBlockEnterCommand 9'});
						}
					}
				else
					alert(this.myBBComposerManager.myBBComposerProperties.getString('p_empty'));
				}
			else if(this.caretIsAtEndOfInlineContainer())
				{
				var newBlock = this.editor.contentDocument.createElement('p');
				newBlock.textContent='\u00A0';
				if(block.nextSibling)
					this.doAction({actionFunction: this.insertElement, nextElement: block.nextSibling, theElement: newBlock, focusNode: newBlock, traceMessage:'doBlockEnterCommand 10'});
				else
					this.doAction({actionFunction: this.insertElement, parentElement: block.parentNode, theElement: newBlock, focusNode: newBlock, traceMessage:'doBlockEnterCommand 11'});
				}
			else if(this.caretIsAtBeginOfInlineContainer())
				{
				var newBlock = this.editor.contentDocument.createElement(block.nodeName);
				this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement:block, targetElement:newBlock, traceMessage:'doBlockEnterCommand 12'});
				var newTextNode = this.editor.contentDocument.createTextNode('\u00A0');
				this.doAction({actionFunction: this.insertElement, parentElement: block, theElement: newTextNode, traceMessage:'doBlockEnterCommand 13'});
				this.doAction({actionFunction: this.insertElement, previousElement:block, theElement: newBlock, focusNode: newBlock, focusOffset:0, traceMessage:'doBlockEnterCommand 14'});
				}
			else if(block)
				{
				this.splitAtCaretPosition();
				}
			}
		}

	bbcomposer.prototype.doDefinitionListitemEnterCommand = function ()
		{
		var selection = this.getSelection();
		var block=this.getSelectedBlock(selection);
		if(selection&&selection.collapsed)
			{
			var curListItem = this.getParentListItem(this.getSelectedNode());
			if(block.lastChild&&curListItem&&this.nodeIsEmpty(curListItem))
				{
				if(curListItem==block.lastChild||curListItem==block.firstChild)
					{
					var newBlock=this.editor.contentDocument.createElement('p');
					newBlock.textContent='\u00A0';
					if(block.lastChild==block.firstChild)
						{
						this.doAction({actionFunction: this.replaceElement, replacedElement: block, dontCopyContent: true, createdElement: newBlock, focusNode: newBlock, traceMessage:'doDefinitionListitemEnterCommand 1'});
						}
					else if(curListItem==block.lastChild)
						{
						this.doAction({actionFunction: this.removeElement, theElement:block.lastChild, traceMessage:'doDefinitionListitemEnterCommand 2'});
						this.doAction({actionFunction: this.insertElement, previousElement: block, theElement: newBlock, focusNode: newBlock, traceMessage:'doDefinitionListitemEnterCommand 3'});
						}
					else
						{
						this.doAction({actionFunction: this.removeElement, theElement:block.firstChild, traceMessage:'doDefinitionListitemEnterCommand 3'});
						this.doAction({actionFunction: this.insertElement, nextElement: block, theElement: newBlock, focusNode: newBlock, traceMessage:'doDefinitionListitemEnterCommand 4'});
						}
					}
				else
					{
					var newList = this.editor.contentDocument.createElement(block.nodeName);
					this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement:block, targetElement:newList, startAfter:curListItem, traceMessage:'doDefinitionListitemEnterCommand 5'});
					if(block.childNodes.length>1)
						this.doAction({actionFunction: this.removeElement, theElement:curListItem, traceMessage:'doDefinitionListitemEnterCommand 6'});
					this.doAction({actionFunction: this.insertElement, previousElement: block, theElement: newList, focusNode: newList.firstChild, traceMessage:'doDefinitionListitemEnterCommand 7'});
					}
				}
			else if(block.lastChild&&curListItem&&this.caretIsAtEndOfInlineContainer())
				{
				if(block.lastChild&&curListItem&&curListItem!=block.lastChild)
					{
					if(!this.nodeIsEmpty(curListItem))
						{
						var newElement = this.editor.contentDocument.createElement((curListItem.nodeName.toLowerCase()=='dd'?'dt':'dd'));
						newElement.appendChild(this.editor.contentDocument.createTextNode('\u00A0'));
						this.doAction({actionFunction: this.insertElement, previousElement: curListItem, theElement: newElement, focusNode:newElement, traceMessage:'doDefinitionListitemEnterCommand 8'});
						}
					else
						{
						var newList = this.editor.contentDocument.createElement(block.nodeName);
						this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement:block, targetElement:newList, startAfter:curListItem, traceMessage:'doDefinitionListitemEnterCommand 9'});
						if(block.childNodes.length>1)
							this.doAction({actionFunction: this.removeElement, theElement:curListitem, traceMessage:'doDefinitionListitemEnterCommand 10'});
						this.doAction({actionFunction: this.insertElement, previousElement: block, theElement: newList, focusNode: newList, traceMessage:'doDefinitionListitemEnterCommand 11'});
						}
					}
				else
					{
					if((!block.lastChild)||this.nodeIsEmpty(block.lastChild))
						{
						this.doAction({actionFunction: this.removeElement, theElement:block.lastChild, traceMessage:'doDefinitionListitemEnterCommand 12'});
						var newBlock=this.editor.contentDocument.createElement('p');
						newBlock.textContent='\u00A0';
						this.doAction({actionFunction: this.insertElement, previousElement: block, theElement: newBlock, focusNode: newBlock, traceMessage:'doDefinitionListitemEnterCommand 13'});
						}
					else
						{
						var newElement = this.editor.contentDocument.createElement((curListItem.nodeName.toLowerCase()=='dd'?'dt':'dd'));
						newElement.appendChild(this.editor.contentDocument.createTextNode('\u00A0'));
						this.doAction({actionFunction: this.insertElement, parentElement: block, theElement: newElement, focusNode: newElement, traceMessage:'doDefinitionListitemEnterCommand 14'});
						}
					}
				}
			else if(block.lastChild&&curListItem&&this.caretIsAtBeginOfInlineContainer())
				{
				var newItem = this.editor.contentDocument.createElement((curListItem.nodeName.toLowerCase()=='dd'?'dt':'dd'));
				newItem.appendChild(this.editor.contentDocument.createTextNode('\u00A0'));
				this.doAction({actionFunction: this.insertElement, nextElement: block.firstChild, theElement: newItem, focusNode:newItem, traceMessage:'doDefinitionListitemEnterCommand 15'});
				}
			else if(block.lastChild&&curListItem)
				{
				this.splitAtCaretPosition();
				}
			else
				{
				var newItem = this.editor.contentDocument.createElement('dt');
				newItem.appendChild(this.editor.contentDocument.createTextNode('\u00A0'));
				this.doAction({actionFunction: this.insertElement, parentElement: block, theElement: newItem, focusNode:newItem, traceMessage:'doDefinitionListitemEnterCommand 16'});
				}
			}
		}

	bbcomposer.prototype.doListitemEnterCommand = function ()
		{
		var selection = this.getSelection();
		var block=this.getSelectedBlock(selection);
		if(selection&&selection.collapsed)
			{
			var curListItem = this.getParentListItem(this.getSelectedNode());
			if(block.lastChild&&curListItem&&this.nodeIsEmpty(curListItem))
				{
				if(curListItem==block.lastChild||curListItem==block.firstChild)
					{
					if(block.parentNode.nodeName.toLowerCase()=='li')
						{
						if(block.lastChild==block.firstChild)
							{
							this.doAction({actionFunction: this.removeElement, theElement:block, traceMessage:'doListitemEnterCommand 1'});
							this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement:block, targetElement:block.parentNode.parentNode, startAfter:block.parentNode, focusNode: curListItem, traceMessage:'doListitemEnterCommand 2'});
							}
						else if(curListItem==block.lastChild)
							{
							this.doAction({actionFunction: this.removeElement, theElement:block.lastChild, traceMessage:'doListitemEnterCommand 3'});
							this.doAction({actionFunction: this.insertElement, previousElement: block.parentNode, theElement: curListItem, focusNode: curListItem, traceMessage:'doListitemEnterCommand 4'});
							}
						else
							{
							this.doAction({actionFunction: this.removeElement, theElement:block.firstChild, traceMessage:'doListitemEnterCommand 5'});
							this.doAction({actionFunction: this.insertElement, nextElement: block.parentNode, theElement: curListItem, focusNode: curListItem, traceMessage:'doListitemEnterCommand 6'});
							}

						}
					else
						{
						var newBlock=this.editor.contentDocument.createElement('p');
						newBlock.textContent='\u00A0';
						if(block.lastChild==block.firstChild)
							{
							this.doAction({actionFunction: this.replaceElement, replacedElement: block, dontCopyContent: true, createdElement: newBlock, focusNode: newBlock, traceMessage:'doListitemEnterCommand 7'});
							}
						else if(curListItem==block.lastChild)
							{
							this.doAction({actionFunction: this.removeElement, theElement:block.lastChild, traceMessage:'doListitemEnterCommand 8'});
							this.doAction({actionFunction: this.insertElement, previousElement: block, theElement: newBlock, focusNode: newBlock, traceMessage:'doListitemEnterCommand 9'});
							}
						else
							{
							this.doAction({actionFunction: this.removeElement, theElement:block.firstChild, traceMessage:'doListitemEnterCommand 10'});
							this.doAction({actionFunction: this.insertElement, nextElement: block, theElement: newBlock, focusNode: newBlock, traceMessage:'doListitemEnterCommand 11'});
							}
						}
					}
				else
					{
					if(block.parentNode.nodeName.toLowerCase()=='li')
						{
						var newLi = this.editor.contentDocument.createElement('li');
						var newList = this.editor.contentDocument.createElement(block.nodeName);
						newLi.appendChild(newList);
						this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement:block, targetElement:newList, startAfter:curListItem, traceMessage:'doListitemEnterCommand 12'});
						if(block.childNodes.length>1)
							this.doAction({actionFunction: this.removeElement, theElement:curListItem, traceMessage:'doListitemEnterCommand 13'});
						this.doAction({actionFunction: this.insertElement, previousElement: block.parentNode, theElement: newLi, focusNode: newList.firstChild, traceMessage:'doListitemEnterCommand 14'});
						}
					else
						{
						var newList = this.editor.contentDocument.createElement(block.nodeName);
						this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement:block, targetElement:newList, startAfter:curListItem, traceMessage:'doListitemEnterCommand 15'});
						if(block.childNodes.length>1)
							this.doAction({actionFunction: this.removeElement, theElement:curListItem, traceMessage:'doListitemEnterCommand 16'});
						this.doAction({actionFunction: this.insertElement, previousElement: block, theElement: newList, focusNode: newList.firstChild, traceMessage:'doListitemEnterCommand 17'});
						}
					}
				}
			else if(block.lastChild&&curListItem&&this.caretIsAtEndOfInlineContainer())
				{
				if(block.lastChild&&curListItem&&curListItem!=block.lastChild)
					{
					if(!this.nodeIsEmpty(curListItem))
						{
						var newElement = this.editor.contentDocument.createElement('li');
						newElement.appendChild(this.editor.contentDocument.createTextNode('\u00A0'));
						this.doAction({actionFunction: this.insertElement, previousElement: curListItem, theElement: newElement, focusNode:newElement, traceMessage:'doListitemEnterCommand 18'});
						}
					else
						{
						var newList = this.editor.contentDocument.createElement(block.nodeName);
						this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement:block, targetElement:newList, startAfter:curListItem, traceMessage:'doListitemEnterCommand 19'});
						if(block.childNodes.length>1)
							this.doAction({actionFunction: this.removeElement, theElement:curListitem, traceMessage:'doListitemEnterCommand 20'});
						this.doAction({actionFunction: this.insertElement, previousElement: block, theElement: newList, focusNode: newList, traceMessage:'doListitemEnterCommand 21'});
						}
					}
				else
					{
					if((!block.lastChild)||this.nodeIsEmpty(block.lastChild))
						{
						this.doAction({actionFunction: this.removeElement, theElement:block.lastChild, traceMessage:'doListitemEnterCommand 22'});
						var newBlock=this.editor.contentDocument.createElement('p');
						newBlock.textContent='\u00A0';
						this.doAction({actionFunction: this.insertElement, previousElement: block, theElement: newBlock, focusNode: newBlock, traceMessage:'doListitemEnterCommand 23'});
						}
					else
						{
						var newElement = this.editor.contentDocument.createElement('li');
						newElement.appendChild(this.editor.contentDocument.createTextNode('\u00A0'));
						this.doAction({actionFunction: this.insertElement, parentElement: block, theElement: newElement, focusNode: newElement, traceMessage:'doListitemEnterCommand 24'});
						}
					}
				}
			else if(block.lastChild&&curListItem&&this.caretIsAtBeginOfInlineContainer())
				{
				var newItem = this.editor.contentDocument.createElement('li');
				newItem.appendChild(this.editor.contentDocument.createTextNode('\u00A0'));
				this.doAction({actionFunction: this.insertElement, nextElement: curListItem, theElement: newItem, focusNode:newItem, traceMessage:'doListitemEnterCommand 28'});
				}
			else if(block.lastChild&&curListItem)
				{
				this.splitAtCaretPosition();
				}
			else
				{
				var newItem = this.editor.contentDocument.createElement('li');
				newItem.appendChild(this.editor.contentDocument.createTextNode('\u00A0'));
				this.doAction({actionFunction: this.insertElement, parentElement: block, theElement: newItem, focusNode:newItem, traceMessage:'doListitemEnterCommand 29'});
				}
			}
		}

	bbcomposer.prototype.doEnterCommand = function ()
		{
		var block=this.getSelectedBlock();
		if(block)
			{
			if(block.tagName.toLowerCase()=='ul'||block.tagName.toLowerCase()=='ol')
				{
				this.doListitemEnterCommand();
				}
			else if(block.tagName.toLowerCase()=='dl')
				{
				this.doDefinitionListitemEnterCommand()
				}
			else if(block.tagName.toLowerCase()=='pre'||block.tagName.toLowerCase()=='address')
				{
				this.doBlockNewLineCommand();
				}
			else
				{
				this.doBlockEnterCommand();
				}
			}
		else
			{
			this.toggleCommand('p');
			}
		}

	bbcomposer.prototype.doNewLineCommand = function ()
		{
		var block=this.getSelectedBlock();
		if(block)
			{
			if(block.tagName.toLowerCase()=='ul'||block.tagName.toLowerCase()=='ol')
				{
				this.doBlockNewLineCommand();
				}
			else if(block.tagName.toLowerCase()=='dl')
				{
				this.doBlockNewLineCommand();
				}
			else if(block.tagName.toLowerCase()=='pre'||block.tagName.toLowerCase()=='address')
				{
				this.doBlockEnterCommand();
				}
			else
				{
				this.doBlockNewLineCommand();
				}
			}
		else
			{
			this.toggleCommand('p');
			}
		}

	bbcomposer.prototype.doBackward = function ()
		{ // Resolve problem of : inline empty element deletion at end of inlineContainer
		var selection = this.getSelection();
		if(selection&&selection.collapsed)
			{
			var offset = selection.focusOffset;
			var node = selection.focusNode;
			var block=this.getSelectedBlock(selection);
			var nextBlock=this.getNextBlock(block);
			var previousBlock=this.getPrecedentBlock(block);
			if(block&&(this.nodeIsEmpty(block)||!this.checkFertility(block.nodeName)))
				{
				if(previousBlock!=block)
					{
					var lDICN=this.getLastDeepestInlineChildNode(previousBlock);
					this.doAction({actionFunction: this.deleteElement, theElement: block, focusNode:(lDICN?lDICN:previousBlock), traceMessage:'doBackward 1'});
					}
				else if(nextBlock!=block)
					{
					var fDICN=this.getFirstDeepestInlineChildNode(nextBlock);
					this.doAction({actionFunction: this.deleteElement, theElement: block, focusNode:(fDICN?fDICN:nextBlock), focusOffset:0, traceMessage:'doBackward 2'});
					}
				else if(block.nodeName.toLowerCase()!='p')
					{
					newBlock=this.editor.contentDocument.createElement('p');
					this.doAction({actionFunction: this.deleteElement, theElement: block, traceMessage:'doBackward 3'});
					this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: block, targetElement:newBlock, focusNode:newBlock, traceMessage:'doBackward 4'});
					}
				else
					alert(this.myBBComposerManager.myBBComposerProperties.getString('last_block'));
				}
			else if(block&&this.caretIsAtBeginOfBlock(true))
				{
				if(previousBlock&&previousBlock!=block&&this.nodeIsEmpty(previousBlock))
					{
					this.doAction({actionFunction: this.deleteElement, theElement: previousBlock, focusNode:node, traceMessage:'doBackward 5'});
					}
				else if(previousBlock&&previousBlock!=block)
					{
					if((block.nodeName.toLowerCase()=='ul'||block.nodeName.toLowerCase()=='ol'||block.nodeName.toLowerCase()=='dl')&&previousBlock.nodeName==block.nodeName)
						{
						this.doAction({actionFunction: this.deleteElement, theElement: block, traceMessage:'doBackward 6'});
						this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: block, targetElement:previousBlock, focusNode:node, traceMessage:'doBackward 7'});
						}
					else if(block.nodeName.toLowerCase()=='table'&&previousBlock.nodeName==block.nodeName)
						{
						this.setFocusedNode(this.getLastInlineContainer(previousBlock));
						}
					else
						{
						var inlineContainer=this.getInlineContainer(node);
						var previousInlineContainer=this.getPrecedentInlineContainer(inlineContainer);
						this.doAction({actionFunction: this.deleteElement, theElement: inlineContainer, traceMessage:'doBackward 8'});
						this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: inlineContainer, targetElement:previousInlineContainer, focusNode:node, traceMessage:'doBackward 9'});
						}
					}
				}
			else if(block&&this.caretIsAtBeginOfInlineContainer(true))
				{
				var inlineContainer=this.getInlineContainer(node);
				var previousInlineContainer=this.getPrecedentInlineContainer(inlineContainer);
				this.doAction({actionFunction: this.deleteElement, theElement: inlineContainer, traceMessage:'doBackward 10'});
				this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: inlineContainer, targetElement:previousInlineContainer, focusNode:node, traceMessage:'doBackward 11'});
				}
			else
				{
				if((!this.nodeIsTextnode(node))&&node.hasChildNodes()&&offset>0)
					{
					node=node.childNodes[offset];
					if(this.nodeIsTextnode(node))
						offset=node.textContent.length;
					else
						offset=node.childNodes.length;
					}
				var nextDeepestInlineNode = this.getFirstDeepestInlineChildNode(this.getNextInlineNode(node));
				var previousDeepestInlineNode = this.getLastDeepestInlineChildNode(this.getPreviousInlineNode(node));
				if(this.nodeIsEmpty(node)||((!this.nodeIsTextnode(node))&&!this.checkFertility(node.nodeName)))
					{
					if(previousDeepestInlineNode)
						{
						this.doAction({actionFunction: this.deleteElement, theElement: node, focusNode:previousDeepestInlineNode, traceMessage:'doBackward 12'});
						}
					else if(nextDeepestInlineNode&&block==this.getParentBlock(nextDeepestInlineNode))
						{
						this.doAction({actionFunction: this.deleteElement, theElement: node, focusNode:nextDeepestInlineNode, focusOffset:0, traceMessage:'doBackward 13'});
						}
					else
						{
						alert('oops');
						//newTextnode=this.editor.contentDocument.createTextNode('\u00A0');
						//this.doAction({actionFunction: this.addTextInTextnode, textNode: node, curOffset: 0, theText: '\u00A0', focusNode:node, focusOffset:0});
						}
					}
				else if(this.nodeIsTextnode(node)&&offset>0)
					{
					/*if(offset>=node.textContent.length&&node.textContent.length<=1)
						{
						this.doAction({actionFunction: this.deleteTextInTextnode, textNode: node, curOffset: offset-1, delLength: 1});
						this.doAction({actionFunction: this.addTextInTextnode, textNode: node, curOffset: 0, theText: '\u00A0', focusNode:node, focusOffset:0});
						}
					else
						{*/
						this.doAction({actionFunction: this.deleteTextInTextnode, textNode: node, curOffset: offset-1, delLength: 1, focusNode:node, focusOffset:offset-1, traceMessage:'doBackward 14'});
						/*}*/
					}
				else if(previousDeepestInlineNode)
					{
					this.setFocusedNode(previousDeepestInlineNode);
					this.doBackward();
					}
				}
			}
		else
			{
			this.doDeleteSelectionCommand();
			}
		}

	bbcomposer.prototype.doDelete = function ()
		{ // Resolve problem of : inline empty element deletion at end of inlineContainer
		var selection = this.getSelection();
		if(selection&&selection.collapsed)
			{
			var offset = selection.focusOffset;
			var node = selection.focusNode;
			var block=this.getSelectedBlock(selection);
			var nextBlock=this.getNextBlock(block);
			var previousBlock=this.getPrecedentBlock(block);
			if(block&&(this.nodeIsEmpty(block)||!this.checkFertility(block.nodeName)))
				{
				if(nextBlock!=block)
					{
					var fDICN=this.getFirstDeepestInlineChildNode(nextBlock);
					this.doAction({actionFunction: this.deleteElement, theElement: block, focusNode:(fDICN?fDICN:nextBlock), focusOffset:0, traceMessage:'doDelete 1'});
					}
				else if(previousBlock!=block)
					{
					var lDICN=this.getLastDeepestInlineChildNode(previousBlock);
					this.doAction({actionFunction: this.deleteElement, theElement: block, focusNode:(lDICN?lDICN:previousBlock), traceMessage:'doDelete 2'});
					}
				else if(block.nodeName.toLowerCase()!='p')
					{
					newBlock=this.editor.contentDocument.createElement('p');
					this.doAction({actionFunction: this.deleteElement, theElement: block, traceMessage:'doDelete 3'});
					this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: block, targetElement:newBlock, focusNode:newBlock, traceMessage:'doDelete 4'});
					}
				else
					alert(this.myBBComposerManager.myBBComposerProperties.getString('last_block'));
				}
			else if(block&&this.caretIsAtEndOfBlock(true))
				{
				if(nextBlock&&nextBlock!=block&&this.nodeIsEmpty(nextBlock))
					{
					this.doAction({actionFunction: this.deleteElement, theElement: nextBlock, focusNode:node, traceMessage:'doDelete 5'});
					}
				else if(nextBlock&&nextBlock!=block)
					{
					if((block.nodeName.toLowerCase()=='ul'||block.nodeName.toLowerCase()=='ol'||block.nodeName.toLowerCase()=='dl')&&nextBlock.nodeName==block.nodeName)
						{
						this.doAction({actionFunction: this.deleteElement, theElement: nextBlock, traceMessage:'doDelete 6'});
						this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: nextBlock, targetElement:block, focusNode:node, traceMessage:'doDelete 7'});
						}
					else if(block.nodeName.toLowerCase()=='table'&&nextBlock.nodeName==block.nodeName)
						{
						this.setFocusedNode(this.getFirstInlineContainer(nextBlock));
						}
					else
						{
						var inlineContainer=this.getInlineContainer(node);
						var nextInlineContainer=this.getNextInlineContainer(inlineContainer);
						this.doAction({actionFunction: this.deleteElement, theElement: nextInlineContainer, traceMessage:'doDelete 8'});
						this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: nextInlineContainer, targetElement:inlineContainer, focusNode:node, traceMessage:'doDelete 9'});
						}
					}
				}
			else if(block&&this.caretIsAtEndOfInlineContainer(true))
				{
				var inlineContainer=this.getInlineContainer(node);
				var nextInlineContainer=this.getNextInlineContainer(inlineContainer);
				this.doAction({actionFunction: this.deleteElement, theElement: nextInlineContainer, traceMessage:'doDelete 10'});
				this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: nextInlineContainer, targetElement:inlineContainer, focusNode:node, traceMessage:'doDelete 11'});
				}
			else
				{
				if((!this.nodeIsTextnode(node))&&node.hasChildNodes()&&offset<node.childNodes.length)
					{
					node=node.childNodes[offset];
					offset=0;
					}
				var nextDeepestInlineNode = this.getFirstDeepestInlineChildNode(this.getNextInlineNode(node));
				var previousDeepestInlineNode = this.getLastDeepestInlineChildNode(this.getPreviousInlineNode(node));
				if(this.nodeIsEmpty(node)||((!this.nodeIsTextnode(node))&&!this.checkFertility(node.nodeName)))
					{
					if(nextDeepestInlineNode&&block==this.getParentBlock(nextDeepestInlineNode))
						{
						this.doAction({actionFunction: this.deleteElement, theElement: node, focusNode:nextDeepestInlineNode, focusOffset:0, traceMessage:'doDelete 12'});
						}
					else if(previousDeepestInlineNode)
						{
						this.doAction({actionFunction: this.deleteElement, theElement: node, focusNode:previousDeepestInlineNode, traceMessage:'doDelete 13'});
						}
					else
						{
						alert('oops');
						//newTextnode=this.editor.contentDocument.createTextNode('\u00A0');
						//this.doAction({actionFunction: this.addTextInTextnode, textNode: node, curOffset: 0, theText: '\u00A0', focusNode:node, focusOffset:0});
						}
					}
				else if(this.nodeIsTextnode(node)&&offset<node.textContent.length)
					{
					/*if(offset==0&&node.textContent.length<=1)
						{
						this.doAction({actionFunction: this.deleteTextInTextnode, textNode: node, curOffset: offset, delLength: 1});
						this.doAction({actionFunction: this.addTextInTextnode, textNode: node, curOffset: 0, theText: '\u00A0', focusNode:node, focusOffset:0});
						}
					else
						{*/
						this.doAction({actionFunction: this.deleteTextInTextnode, textNode: node, curOffset: offset, delLength: 1, focusNode:node, focusOffset:offset, traceMessage:'doDelete 14'});
						/*}*/
					}
				else if(nextDeepestInlineNode)
					{
					this.setFocusedNode(nextDeepestInlineNode,0);
					this.doDelete();
					}
				}
			}
		else
			{
			this.doDeleteSelectionCommand(true);
			}
		}

	// Blocks command
	bbcomposer.prototype.blocksCommandIsOn = function ()
		{
		var element = this.getSelectedBlock();
		if(element)
			document.getElementById('bbcomposer-blocks-button').value=element.nodeName.toLowerCase();
		return false;
		}

	bbcomposer.prototype.canUseBlocksCommand = function (commandParams)
		{
		if(this.getSelectedElement())
			return true;
		return false;
		}

	bbcomposer.prototype.doBlocksCommand = function ()
		{
		var value = document.getElementById('bbcomposer-blocks-button').value;
		if(value)
			this.toggleCommand(value);
		}

	// Elements commands
	bbcomposer.prototype.elementCommandIsOn = function (commandParams)
		{
		var element = this.getSelectedElement();
		while(element && element!=this.rootElement)
			{
			if(element&&element.nodeName.toLowerCase()==commandParams[1])
				{
				if((!commandParams[2])||(element.hasAttribute(commandParams[2])&&element.getAttribute(commandParams[2])==commandParams[3]))
					return true;
				}
			element=element.parentNode;
			}
		return false;
		}

	bbcomposer.prototype.canUseElementCommand = function (commandParams)
		{
		if(this.getSelectedElement())
			return true;
		return false;
		}

	bbcomposer.prototype.doElementCommand = function (markup,attribute,value)
		{
		if(markup==='a'||markup==='img')
			{
			this.toggleDialogCommand(markup);
			}
		else if(markup==='table')
			{
			this.toggleTable();
			}
		else
			{
			var element = this.getSelectedElement();
			if((!attribute)||(element.hasAttribute(attribute)&&element.getAttribute(attribute)==value))
				this.toggleCommand(markup);
			else
				{
				var attributes=[];
				attributes[attribute]=(value+'').replace('_','-');
				this.toggleCommand(markup,attributes);
				}
			}
		}

	bbcomposer.prototype.toggleCommand = function (markup, attributes)
		{
		var selection = this.getSelection();
		var block = this.getSelectedBlock(selection);
		var superblock = this.getSelectedSuperblock(selection);
		var element = this.getSelectedElement(selection);
		var forceSuperblock=false;
		var focusedElement = null;
		while(element!=null&&element.nodeName.toLowerCase()!=markup)
			{
			if(element!=this.rootElement)
				element = element.parentNode;
			else
				element=null;
			}
		if(this.checkMarkupType(markup,'mixed'))
			{
			if(element!=null&&element.nodeName.toLowerCase()==markup)
				{
				if(!this.elementHasParentBlock(element))
					forceSuperblock=true;
				}
			if(block==null) { forceSuperblock=true; }
			}
		if(this.checkMarkupType(markup,'block'))
			{
			if(block!=null)
				{
				var newBlock;
				var blockId = false;
				if(block.hasAttribute('id'))
					blockId = block.getAttribute('id');
				var blockStyle = false;
				if(block.hasAttribute('style'))
					blockStyle = block.getAttribute('style');
				var blockClass = false;
				if(block.hasAttribute('class'))
					blockClass = block.getAttribute('class');
				var blockLang = false;
				if(block.hasAttribute('lang'))
					blockLang = block.getAttribute('lang');
				if(markup=='hr')
					{
					if(block&&block.nodeName.toLowerCase()=='hr')
						{
						this.doAction({actionFunction: this.removeElement, theElement:block, traceMessage:'toggleCommand 16'});
						focusedNode=(this.getPreviousDeepestNode(block)?this.getPreviousDeepestNode(block):this.getNextDeepestNode(block));
						}
					else
						{
						var newBlock = this.editor.contentDocument.createElement(markup);
						if(block&&block.nextSibling)
							this.doAction({actionFunction: this.insertElement, nextElement: block.nextSibling, theElement: newBlock, traceMessage:'toggleCommand 17'});
						else
							this.doAction({actionFunction: this.insertElement, parentElement: block.parentNode, theElement: newBlock, traceMessage:'toggleCommand 18'});
						focusedNode=newBlock;
						}
					}
				else if(markup=='dl'&&block.nodeName.toLowerCase()!='dl')
					{
					newBlock = this.editor.contentDocument.createElement(markup);
					if(block.nodeName.toLowerCase()!='ul'&&block.nodeName.toLowerCase()!='ol')
						{
						if(block.hasChildNodes())
							{
							for(i=0; block.hasChildNodes(); i++)
								{
								if(i/2==Math.round(i/2))
									var newItem = this.editor.contentDocument.createElement('dt');
								else
									var newItem = this.editor.contentDocument.createElement('dd');
								for(j=0; j<block.childNodes.length; j++)
									if(block.childNodes[j].nodeName.toLowerCase()=='br')
										break;
								if(j==0)
									{
									this.doAction({actionFunction: this.deleteElement, theElement: block.firstChild, traceMessage:'toggleCommand 1'});
									}
								else
									{
									if(j<block.childNodes.length-1)
										this.doAction({actionFunction: this.deleteElement, theElement: block.childNodes[j], traceMessage:'toggleCommand 2'});
									this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement:block, targetElement:newItem, startAtIndex: 0, stopAtIndex: j, traceMessage:'toggleCommand 3'});
									this.doAction({actionFunction: this.insertElement, parentElement: newBlock, theElement: newItem, traceMessage:'toggleCommand 4'});
									}
								}
							}
						else
							{
							var newItem = this.editor.contentDocument.createElement('dt');
							newItem.appendChild(this.editor.contentDocument.createTextNode('\u00A0'));
							newBlock.appendChild(newItem);
							}
						}
					else
						{
						for(var i=0; i<block.childNodes.length; i++)
							{
							if(i/2==Math.round(i/2))
								var newItem = this.editor.contentDocument.createElement('dt');
							else
								var newItem = this.editor.contentDocument.createElement('dd');
							this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement:block.childNodes[i], targetElement:newItem, traceMessage:'toggleCommand 5'});
							this.doAction({actionFunction: this.insertElement, parentElement: newBlock, theElement: newItem, traceMessage:'toggleCommand 6'});
							}
						}
					this.doAction({actionFunction: this.replaceElement, replacedElement: block, createdElement: newBlock, dontCopyContent: true, traceMessage:'toggleCommand 7'});
					focusedNode=this.getFirstDeepestChildNode(newBlock);
					}
				else if((markup=='ul'||markup=='ol')&&block.nodeName.toLowerCase()!='ul'&&block.nodeName.toLowerCase()!='ol')
					{
					newBlock = this.editor.contentDocument.createElement(markup);
					if(block.nodeName.toLowerCase()=='dl')
						{
						if(block.hasChildNodes())
							{
							var x=block.childNodes.length;
							for(i=0; i<x; i++)
								{
								var newItem = this.editor.contentDocument.createElement('li');
								this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement:block.childNodes[i], targetElement:newItem, traceMessage:'toggleCommand 8'});
								this.doAction({actionFunction: this.insertElement, parentElement: newBlock, theElement: newItem, traceMessage:'toggleCommand 9'});
								}
							}
						else
							{
							var newItem = this.editor.contentDocument.createElement('li');
							newItem.appendChild(this.editor.contentDocument.createTextNode('\u00A0'));
							newBlock.appendChild(newItem);
							}
						this.doAction({actionFunction: this.replaceElement, replacedElement: block, createdElement: newBlock, dontCopyContent: true, traceMessage:'toggleCommand 10'});
						focusedNode=this.getFirstDeepestChildNode(newBlock);
						}
					else
						{
						if(block.hasChildNodes())
							{
							for(i=0; i<block.childNodes.length; i++)
								{
								if(block.childNodes[i].nodeName.toLowerCase()!='br')
									{
									var newItem = this.editor.contentDocument.createElement('li');
									for(var j=i; j<block.childNodes.length; j++)
										if(block.childNodes[j].nodeName.toLowerCase()=='br')
											break;
									this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement:block, targetElement:newItem, startAtIndex: i, stopAtIndex: j, traceMessage:'toggleCommand 11'});
									this.doAction({actionFunction: this.insertElement, parentElement: newBlock, theElement: newItem, traceMessage:'toggleCommand 12'});
									}
								}
							}
						else
							{
							var newItem = this.editor.contentDocument.createElement('li');
							newItem.appendChild(this.editor.contentDocument.createTextNode('\u00A0'));
							newBlock.appendChild(newItem);
							}
						this.doAction({actionFunction: this.replaceElement, replacedElement: block, createdElement: newBlock, dontCopyContent: true, traceMessage:'toggleCommand 13'});
						focusedNode=this.getFirstDeepestChildNode(newBlock);
						}
					}
				else if(markup!='ul'&&markup!='ol'&&markup!='dl'&&(block.nodeName.toLowerCase()=='ul'||block.nodeName.toLowerCase()=='ol'||block.nodeName.toLowerCase()=='dl'))
					{
					newBlock = this.editor.contentDocument.createElement(markup);
					if(block.hasChildNodes())
						{
						for(var i=0; i<block.childNodes.length; i++)
							{
							this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement:block.childNodes[i], targetElement:newBlock});
							if(i<block.childNodes.length-1)
								this.doAction({actionFunction: this.insertElement, parentElement: newBlock, theElement: this.editor.contentDocument.createElement('br'), traceMessage:'toggleCommand 14'});
							}
						}
					else
						newBlock.textContent='\u00A0';
					this.doAction({actionFunction: this.replaceElement, replacedElement: block, createdElement: newBlock, dontCopyContent: true, traceMessage:'toggleCommand 15'});
					focusedNode=this.getFirstDeepestChildNode(newBlock);
					}
				else
					{
					var newBlock = this.editor.contentDocument.createElement(markup);
					if(block)
						this.doAction({actionFunction: this.replaceElement, replacedElement: block, createdElement: newBlock, traceMessage:'toggleCommand 20'});
					else if(superblock)
						this.doAction({actionFunction: this.insertElement, theElement: newBlock, parentElement:superblock , traceMessage:'toggleCommand 20b'});
					else
						this.doAction({actionFunction: this.insertElement, theElement: newBlock, parentElement:this.rootElement , traceMessage:'toggleCommand 20c'});
					focusedNode=newBlock;
					}
				if(blockId)
					this.doAction({actionFunction: this.updateAttribute, theElement: newBlock, theAttribute:'id', theValue:blockId});
				if(blockStyle)
					this.doAction({actionFunction: this.updateAttribute, theElement: newBlock, theAttribute:'style', theValue:blockStyle});
				if(blockClass)
					this.doAction({actionFunction: this.updateAttribute, theElement: newBlock, theAttribute:'class', theValue:blockClass});
				if(blockLang)
					this.doAction({actionFunction: this.updateAttribute, theElement: newBlock, theAttribute:'lang', theValue:blockLang});
				this.doAction({actionFunction: this.setSelection, focusNode: focusedNode});
				}
			else
				{
				var newBlock = this.editor.contentDocument.createElement(markup);
				if(markup=='ul'||markup=='ol'||markup=='dl')
					{
					var x = this.bbcLanguageSupport.acceptedMarkups[markup]['childs'].length;
					for(var i=0; i<x; i++)
						{
						var newItem = this.editor.contentDocument.createElement(this.bbcLanguageSupport.acceptedMarkups[markup]['childs'][i]);
						newBlock.appendChild(newItem);
						newItem.textContent='\u00A0';
						}
					}
				else if(markup!='hr')
					{
					newBlock.textContent='\u00A0';
					}
				if(superblock)
					this.doAction({actionFunction: this.insertElement, parentElement: superblock, theElement: newBlock, focusNode:newBlock, traceMessage:'toggleCommand 21'});
				else
					this.doAction({actionFunction: this.insertElement, parentElement: this.rootElement, theElement: newBlock, focusNode:newBlock, traceMessage:'toggleCommand 21'});
				}
			}
		else if(forceSuperblock||this.checkMarkupType(markup,'superblock'))
			{
			if(superblock&&superblock.nodeName.toLowerCase()==markup)
				{
				var superblockId = false;
				if(superblock.hasAttribute('id'))
					superblockId = superblock.getAttribute('id');
				var superblockStyle = false;
				if(superblock.hasAttribute('style'))
					superblockStyle = superblock.getAttribute('style');
				var superblockClass = false;
				if(superblock.hasAttribute('class'))
					superblockClass = superblock.getAttribute('class');
				var superblockLang = false;
				if(superblock.hasAttribute('lang'))
					superblockLang = superblock.getAttribute('lang');
				if(superblock.hasChildNodes())
					{
					if(block&&block.parentNode==superblock&&superblock.childNodes.length>1)
						{
						if(block==superblock.firstChild)
							{
							this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: superblock, targetElement: superblock.parentNode, nextElement: superblock, startAt: block, exchangeLength:1, focusNode:this.getFirstDeepestChildNode(block), traceMessage:'toggleCommand 22'});
							focusedNode=block;
							}
						else if(block==superblock.lastChild)
							{
							this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: superblock, targetElement: superblock.parentNode, previousElement: superblock, startAt: block, focusNode:this.getFirstDeepestChildNode(block), traceMessage:'toggleCommand 23'});
							}
						else
							{
							var newSuperblock = this.editor.contentDocument.createElement(markup);
							if(superblockId)
								this.doAction({actionFunction: this.updateAttribute, theElement: newSuperblock, theAttribute:'id', theValue:superblockId});
							if(superblockStyle)
								this.doAction({actionFunction: this.updateAttribute, theElement: newSuperblock, theAttribute:'style', theValue:superblockStyle});
							if(superblockClass)
								this.doAction({actionFunction: this.updateAttribute, theElement: newSuperblock, theAttribute:'class', theValue:superblockClass});
							if(superblockLang)
								this.doAction({actionFunction: this.updateAttribute, theElement: newSuperblock, theAttribute:'lang', theValue:superblockLang});
							this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: superblock, targetElement: newSuperblock, startAfter: block, traceMessage:'toggleCommand 24'});
							this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: superblock, targetElement: superblock.parentNode, previousElement: superblock, startAt: block, exchangeLength: 1, traceMessage:'toggleCommand 25'});
							this.doAction({actionFunction: this.insertElement, theElement: newSuperblock, previousElement: block, traceMessage:'toggleCommand 26'});
							focusedNode=block;
							}
						}
					else
						{
						focusedNode = superblock.firstChild;
						this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: superblock, targetElement: superblock.parentNode, nextElement: superblock, traceMessage:'toggleCommand 27'});
						this.doAction({actionFunction: this.removeElement, theElement: superblock, focusNode:this.getFirstDeepestChildNode(focusedNode), traceMessage:'toggleCommand 28'});
						}
					}
				else
					{
					if(superblock.nextSibling)
						focusedElement=superblock.nextSibling;
					else if(superblock.previousSibling)
						focusedElement=superblock.previousSibling;
					this.doAction({actionFunction: this.removeElement, theElement: superblock, focusNode: focusedElement, traceMessage:'toggleCommand 29'});
					}
				}
			else if(superblock)
				{
				var newSuperblock = this.editor.contentDocument.createElement(markup);
				this.toggleAttributes(newSuperblock, attributes);
				this.doAction({actionFunction: this.replaceElement, replacedElement: superblock, createdElement: newSuperblock, focusNode: superblock.firstChild, traceMessage:'toggleCommand 30'});
				}
			else
				{
				var newSuperblock = this.editor.contentDocument.createElement(markup);
				if(block&&selection.collapsed)
					{
					this.doAction({actionFunction: this.insertElement, nextElement: block, theElement: newSuperblock, traceMessage:'toggleCommand 34'});
					this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: block.parentNode, targetElement:newSuperblock, startAt: block, stopAfter: block, focusNode:newSuperblock, traceMessage:'toggleCommand 31a'});
					}
				else
					{
					var rangeBegin = selection.startContainer;
					while(rangeBegin&&rangeBegin.parentNode&&rangeBegin.parentNode!=this.rootElement)
						rangeBegin = rangeBegin.parentNode;
					var rangeEnd = selection.endContainer;
					while(rangeEnd&&rangeEnd.parentNode&&rangeEnd.parentNode!=this.rootElement)
						rangeEnd = rangeEnd.parentNode;
					if(rangeBegin.parentNode&&rangeEnd.parentNode)
						{
						if(rangeEnd.nextSibling)
							var nextElement=rangeEnd.nextSibling;
						this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: this.rootElement, targetElement:newSuperblock, startAt: rangeBegin, stopAfter: rangeEnd, traceMessage:'toggleCommand 31'});
						if(nextElement)
							this.doAction({actionFunction: this.insertElement, theElement: newSuperblock, nextElement: nextElement, focusNode:newSuperblock, traceMessage:'toggleCommand 32'});
						else
							this.doAction({actionFunction: this.insertElement, theElement: newSuperblock, parentElement: this.rootElement, focusNode:newSuperblock, traceMessage:'toggleCommand 33'});
						}
					else
						{
						var newP = this.editor.contentDocument.createElement('p');
						newP.textContent='\u00A0';
						newSuperblock.appendChild(newP);
						this.doAction({actionFunction: this.insertElement, parentElement: this.rootElement, theElement: newSuperblock, focusNode:newSuperblock, traceMessage:'toggleCommand 34'});
						}
					}
				this.toggleAttributes(newSuperblock, attributes);
				}
			}
		else
			{
			if(!element)
				element = this.getSelectedInline();
			if(element!=null&&element.nodeName.toLowerCase()==markup&&!attributes)
				{
				if(((!this.nodeIsTextnode(selection.focusNode))||selection.focusOffset==0)&&this.isAtBeginOf(selection.focusNode,element,false))
					{
					var previousInlineNode=this.getPreviousInlineNode(element);
					if(previousInlineNode&&previousInlineNode.parentNode==element.parentNode&&this.nodeIsTextnode(previousInlineNode))
						{
						this.doAction({actionFunction: this.doEmptyAction, focusNode: previousInlineNode, focusOffset:previousInlineNode.textContent.lenght, traceMessage:'toggleCommand 35'});
						}
					else
						{
						var newNode = this.editor.contentDocument.createTextNode('\u00A0');
						this.doAction({actionFunction: this.insertElement, theElement: newNode, nextElement: element, focusNode: newNode, focusOffset: 1, traceMessage:'toggleCommand 36'});
						}
					}
				else if(((!this.nodeIsTextnode(selection.focusNode))||selection.focusOffset==selection.focusNode.textContent.length)&&this.isAtEndOf(selection.focusNode,element,false))
					{
					var nextInlineNode=this.getNextInlineNode(element);
					if(nextInlineNode&&nextInlineNode.parentNode==element.parentNode&&this.nodeIsTextnode(nextInlineNode))
						{
						this.doAction({actionFunction: this.doEmptyAction, focusNode: nextInlineNode, focusOffset:0, traceMessage:'toggleCommand 38'});
						}
					else
						{
						var newNode = this.editor.contentDocument.createTextNode('\u00A0');
						this.doAction({actionFunction: this.insertElement, theElement: newNode, previousElement: element, focusNode: newNode, focusOffset: 1, traceMessage:'toggleCommand 39'});
						}
					}
				else
					{
					this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: element, targetElement: element.parentNode, nextElement: element, traceMessage:'toggleCommand 40'});
					this.doAction({actionFunction: this.removeElement, theElement: element, focusNode:element.parentNode, traceMessage:'toggleCommand 41'});
					}
				}
			else if(element!=null&&element.nodeName.toLowerCase()==markup&&attributes)
				{
				this.toggleAttributes(element, attributes);
				}
			else
				{
				if(block)
					{
					var newElement = this.editor.contentDocument.createElement(markup);
					if(selection.collapsed)
						{
						if((!this.checkMarkup(markup))||this.bbcLanguageSupport.acceptedMarkups[markup]['childs'])
							newElement.textContent='\u00A0';
						if(this.nodeIsTextnode(selection.focusNode))
							{
							if(selection.focusOffset==0)
								{
								this.doAction({actionFunction: this.insertElement, theElement: newElement, nextElement: selection.focusNode, focusNode: newElement, traceMessage:'toggleCommand 42'});
								}
							else if(selection.focusOffset>=selection.focusNode.textContent.length)
								{
								this.doAction({actionFunction: this.insertElement, theElement: newElement, previousElement: selection.focusNode, focusNode: newElement, traceMessage:'toggleCommand 43'});
								}
							else
								{
								var newTextNode = this.editor.contentDocument.createTextNode(selection.focusNode.textContent.substring(selection.focusOffset,selection.focusNode.textContent.length));
								this.doAction({actionFunction: this.deleteTextInTextnode, textNode: selection.focusNode, curOffset: selection.focusOffset, delLength: selection.focusNode.textContent.length-selection.focusOffset, traceMessage:'toggleCommand 44'});
								this.doAction({actionFunction: this.insertElement, theElement: newTextNode, previousElement: selection.focusNode, traceMessage:'toggleCommand 45'});
								this.doAction({actionFunction: this.insertElement, theElement: newElement, previousElement: selection.focusNode, focusNode: newElement, traceMessage:'toggleCommand 46'});
								}
							}
						else
							{
							node=selection.focusNode;
							if(node.hasChildNodes())
								{
								if(selection.focusOffset==0)
									node=node.firstChild;
								else
									node=node.childNodes[selection.focusOffset-1];
								}
							if(this.elementIsBlock(node))
								this.doAction({actionFunction: this.insertElement, theElement: newElement, parentElement: node, focusNode: newElement, traceMessage:'toggleCommand 46a'});
							else
								this.doAction({actionFunction: this.insertElement, theElement: newElement, previousElement: node, focusNode: newElement, traceMessage:'toggleCommand 46b'});
							}
						if(attributes)
							this.toggleAttributes(newElement, attributes);
						}
					else
						{
						if(this.bbcLanguageSupport.acceptedMarkups[markup]['childs'])
							{
							this.toggleAttributes(newElement, attributes);
							var elementChilds=this.doSeparateSelectionCommand(selection);
							var nextElement, parentElement;
							if(elementChilds[elementChilds.length-1].nextSibling)
								{
								nextElement=elementChilds[elementChilds.length-1].nextSibling;
								}
							else
								{
								parentElement=elementChilds[0].parentNode;
								}
							this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: elementChilds[0].parentNode, targetElement:newElement, startAt:elementChilds[0], stopAfter:elementChilds[elementChilds.length-1], traceMessage:'toggleCommand 47a'});
							if(nextElement)
								{
								this.doAction({actionFunction: this.insertElement, theElement: newElement, nextElement: nextElement, focusNode: newElement, traceMessage:'toggleCommand 47b'});
								}
							else
								{
								this.doAction({actionFunction: this.insertElement, theElement: newElement, parentElement: parentElement, focusNode: newElement, traceMessage:'toggleCommand 47c'});
								}
/*							var focusedNodeBefore=this.getPreviousDeepestNode(nodesToDelete[0]);
							if(this.nodeIsTextnode(focusedNodeBefore))
								focusedOffsetBefore=focusedNodeBefore.textContent.length;
							else
								focusedOffsetBefore=0;
							var focusedNodeAfter=this.getNextDeepestNode(nodesToDelete[nodesToDelete.length-1]);
							focusedOffsetAfter=0;
							var focusNode;
							if(focusedNodeAfter)
								{
								focusNode=focusedNodeAfter;
								focusedOffset=focusedOffsetAfter;
								}
							else
								{
								focusNode=focusedNodeBefore;
								focusedOffset=focusedOffsetBefore;
								}
						/*	if(this.nodeIsTextnode(focusNode))
								{
								if(focusedOffset<focusNode.textContent.length)
									{
									var newTextnode=document.createTextNode(selection.focusNode.textContent.substring(focusedOffset));
									this.doAction({actionFunction: this.insertElement, theElement: newTextnode, previousElement:selection.focusNode , traceMessage:'toggleCommand 47a'});
									this.doAction({actionFunction: this.deleteTextInTextnode, textNode: selection.focusNode, curOffset: focusedOffset, delLength:selection.focusNode.textContent.length-focusedOffset, traceMessage:'toggleCommand 47b'});
									nextElement=newTextnode;
									}
								}
							else
								{
								nextElement=selection.focusNode;
								}
							if(focusNode)
								this.doAction({actionFunction: this.insertElement, theElement: newElement, nextElement: focusNode, focusNode: newElement, traceMessage:'toggleCommand 47c'});
							else
								this.doAction({actionFunction: this.insertElement, theElement: newElement, parentElement: selection.focusNode.parentNode, focusNode: newElement, traceMessage:'toggleCommand 47d'});*/
							}
						else
							{
							var newElement = this.editor.contentDocument.createElement(markup);
							this.doAction({actionFunction: this.insertElement, theElement: newElement, parentElement: this.getSelectedBlock(), focusNode: newElement, traceMessage:'toggleCommand 48'});
							}
						if(attributes)
							this.toggleAttributes(newElement, attributes);
						}
					}
				else
					{
					var blocks = this.getSelectedBlocks(selection);
					if(blocks&&(!this.checkMarkup(markup))||this.bbcLanguageSupport.acceptedMarkups[markup]['childs'])
						{
						for(var i=0; i<blocks.length; i++)
							{
							var newElement = this.editor.contentDocument.createElement(markup);
							this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: blocks[i], targetElement: newElement, traceMessage:'toggleCommand 49'});
							this.doAction({actionFunction: this.insertElement, theElement: newElement, parentElement: blocks[i], focusNode: (i>=blocks.length?blocks[i]:null), traceMessage:'toggleCommand 50'});
							if(attributes)
								this.toggleAttributes(newElement, attributes);
							}
						}
					else if(blocks&&blocks[0])
						{
						var newElement = this.editor.contentDocument.createElement(markup);
						this.doAction({actionFunction: this.insertElement, theElement: newElement, parentElement: blocks[0], focusNode: newElement, traceMessage:'toggleCommand 51'});
						if(attributes)
							this.toggleAttributes(newElement, attributes);
						}
					}
				}
			}
		}

	bbcomposer.prototype.toggleDialogCommand = function (markup)
		{
		var attributes = new Array();
		var element = this.getSelectedElement();
		while(element!=null&&element.nodeName.toLowerCase()!=markup)
			{
			if(element!=this.rootElement)
				element = element.parentNode;
			else
				element=null;
			}
		if(element && element.tagName.toLowerCase()==markup && element.hasAttributes())
			attributes = element.attributes;
		attributes = this.myBBComposerManager.openPopupDialog(markup, attributes);
		if(attributes!==null)
			{
			this.toggleCommand(markup, attributes);
			if(markup=='img')
				this.checkFiles();
			}
		else if(element)
			{
			this.toggleCommand(markup);
			}
		}

	bbcomposer.prototype.toggleAttributes = function (element, attributes)
		{
		var markup = element.tagName.toLowerCase();
		if(this.bbcLanguageSupport.acceptedMarkups[markup]['attributes'])
			{
			var x = this.bbcLanguageSupport.acceptedMarkups[markup]['attributes'].length;
			if(!attributes)
				{
				attributes = new Array();
				for(var i=0; i<x; i++)
					{
					if(this.bbcLanguageSupport.acceptedMarkups[markup]['attributes'][i]['type'])
						attributes[this.bbcLanguageSupport.acceptedMarkups[markup]['attributes'][i]['name']] = window.prompt(this.myBBComposerManager.myBBComposerProperties.getString(markup + "_" + this.bbcLanguageSupport.acceptedMarkups[markup]['attributes'][i]['name']), this.bbcLanguageSupport.acceptedMarkups[markup]['attributes'][i]['default']);
					}
				}
			for(var i=0; i<x; i++)
				{
				this.doAction({actionFunction: this.updateAttribute, theElement: element, theAttribute:this.bbcLanguageSupport.acceptedMarkups[markup]['attributes'][i]['name'], theValue: attributes[this.bbcLanguageSupport.acceptedMarkups[markup]['attributes'][i]['name']], traceMessage:'updateAttributes 1'});
				}
			}
		}

	// Anchor command
	bbcomposer.prototype.doAnchorCommand = function ()
		{
		var element = this.getSelectedElement();
		if(element)
			var value = window.prompt(this.myBBComposerManager.myBBComposerProperties.getString("anchor"), (element.getAttribute('id')?element.getAttribute('id'):''));
		if(this.editor.contentDocument.getElementById(value)&&this.editor.contentDocument.getElementById(value)!=element)
			alert(this.myBBComposerManager.myBBComposerProperties.getString('anchor_exist'));
		else
			this.doAttributeCommand('id',value);
		}

	bbcomposer.prototype.canUseAnchorCommand = function (commandParams)
		{
		if(this.getSelectedElement())
			return true;
		return false;
		}

	// Attributes Commands
	bbcomposer.prototype.doAttributeCommand = function (attribute, value)
		{
		var element = this.getSelectedElement();
		if(element)
			{
			if(!value)
				value = window.prompt(this.myBBComposerManager.myBBComposerProperties.getString("att_"+attribute), (element.hasAttribute(attribute)?element.getAttribute(attribute):''));
			if((!value)||(!element.hasAttribute(attribute))||value!=element.getAttribute(attribute))
				this.doAction({actionFunction: this.updateAttribute, theElement: element, theAttribute:attribute, theValue: value, selectNode:element, traceMessage:'doAttributeCommand 1'});
			}
		}

	bbcomposer.prototype.attributeCommandIsOn = function (commandParams)
		{
		var element = this.getSelectedElement();
		if(element&&element.hasAttributes())
			{
			for(var i=element.attributes.length-1; i>=0; i--)
				{
				if(element.attributes[i].name==commandParams[1]&&((!commandParams[2])||element.attributes[i].value==commandParams[2]))
					return true
				}
			}
		return false;
		}

	bbcomposer.prototype.canUseAttributeCommand = function (commandParams)
		{
		var element;
		if((commandParams[2]&&commandParams[2]=='superblock')||(commandParams[3]&&commandParams[3]=='superblock'))
			element=this.getSelectedSuperblock();
		else if((commandParams[2]&&commandParams[2]=='block')||(commandParams[3]&&commandParams[3]=='block'))
			element=this.getSelectedBlock();
		else
			element=this.getSelectedElement();
		if(element&&this.checkAttribute(element.nodeName,commandParams[1]))
			return true;
		return false;
		}

	bbcomposer.prototype.toggleTable = function ()
		{
		var params = new Array();
		var table = this.getSelectedBlock();
		if(table&&table.tagName.toLowerCase()=='table')
			{
			if(table.getElementsByTagName('caption')[0])
				params['caption'] = table.getElementsByTagName('caption')[0].innerHTML;
			if(table.hasAttribute('summary')&&table.getAttribute('summary'))
				params['summary'] = table.getAttribute('summary');
			if(table.getElementsByTagName('thead')[0])
				{
				params['thead'] = table.getElementsByTagName('thead')[0].childNodes.length;
				params['cols'] = table.getElementsByTagName('tbody')[0].firstChild.childNodes.length;
				}
			if(table.getElementsByTagName('tfoot')[0])
				{
				params['tfoot'] = table.getElementsByTagName('tfoot')[0].childNodes.length;
				params['cols'] = table.getElementsByTagName('tbody')[0].firstChild.childNodes.length;
				}
			if(table.getElementsByTagName('tbody')[0])
				{
				params['tbody'] = table.getElementsByTagName('tbody')[0].childNodes.length;
				params['cols'] = table.getElementsByTagName('tbody')[0].firstChild.childNodes.length;
				}
			if(!params['cols'])
				params['cols'] = table.getElementsByTagName('tr')[0].childNodes.length;
			}
		else
			table = null;
		params = this.myBBComposerManager.openPopupDialog('table', params);
		if(params)
			{
			if(!table)
				table = this.editor.contentDocument.createElement('table');
			if(params['summary'])
				table.setAttribute('summary', params['summary']);
			if(table.getElementsByTagName('tbody')[0])
				var caption = table.getElementsByTagName('caption')[0];
			else
				{
				var caption = this.editor.contentDocument.createElement('caption');
				table.appendChild(caption);
				}
			if(params['caption'])
				caption.textContent = params['caption'];
			else
				caption.textContent =  '\u00A0';
			if(params['thead'])
				{
				if(!table.getElementsByTagName('thead')[0])
					table.appendChild(this.editor.contentDocument.createElement('thead'));
				while(params['thead'] < table.getElementsByTagName('thead')[0].childNodes.length)
					table.getElementsByTagName('thead')[0].removeChild(table.getElementsByTagName('thead')[0].lastChild);
				while(params['thead'] > table.getElementsByTagName('thead')[0].childNodes.length)
					table.getElementsByTagName('thead')[0].appendChild(this.editor.contentDocument.createElement('tr'));
				}
			else
				if(table.getElementsByTagName('thead')[0])
					table.removeChild(table.getElementsByTagName('thead')[0]);
			if(params['tfoot'])
				{
				if(!table.getElementsByTagName('tfoot')[0])
					table.appendChild(this.editor.contentDocument.createElement('tfoot'));
				while(params['tfoot'] < table.getElementsByTagName('tfoot')[0].childNodes.length)
					table.getElementsByTagName('tfoot')[0].removeChild(table.getElementsByTagName('tfoot')[0].lastChild);
				while(params['tfoot'] > table.getElementsByTagName('tfoot')[0].childNodes.length)
					table.getElementsByTagName('tfoot')[0].appendChild(this.editor.contentDocument.createElement('tr'));
				}
			else
				if(table.getElementsByTagName('tfoot')[0])
					table.removeChild(table.getElementsByTagName('tfoot')[0]);
			if(params['tbody'])
				{
				if(!table.getElementsByTagName('tbody')[0])
					table.appendChild(this.editor.contentDocument.createElement('tbody'));
				while(params['tbody'] < table.getElementsByTagName('tbody')[0].childNodes.length)
					table.getElementsByTagName('tbody')[0].removeChild(table.getElementsByTagName('tbody')[0].lastChild);
				while(params['tbody'] > table.getElementsByTagName('tbody')[0].childNodes.length)
					table.getElementsByTagName('tbody')[0].appendChild(this.editor.contentDocument.createElement('tr'));
				}
			else
				if(table.getElementsByTagName('tbody')[0])
					table.removeChild(table.getElementsByTagName('tbody')[0]);
			if(!params['cols'])
				params['cols'] = 1;
			var rows = table.getElementsByTagName('tr');
			var x = rows.length;
			var tag;
			for(var i=0; i<x; i++)
				{
				if(rows[i].parentNode.tagName.toLowerCase()=="thead")
					tag = 'th';
				else
					tag = 'td';
				while(rows[i].childNodes.length<params['cols'])
					{
					var newCol = this.editor.contentDocument.createElement(tag);
					rows[i].appendChild(newCol);
					newCol.textContent = '\u00A0';
					}
				while(rows[i].childNodes.length>params['cols'])
					rows[i].removeChild(rows[i].lastChild);
				}
			if(this.getNextBlock(this.getSelectedBlock()))
				this.doAction({actionFunction: this.insertElement, theElement: table, nextElement: this.getNextBlock(this.getSelectedBlock()), traceMessage:'toggleTable x1'});
			else
				this.doAction({actionFunction: this.insertElement, theElement: table, parentElement: this.getSelectedBlock().parentNode, traceMessage:'toggleTable x1'});
			//table.style.width = "80%";
			//table.align = "center";
			//table.cellSpacing = "1px";
			//table.cellPadding = "1px";
			}
		/*else
			if(table) { table.parentNode.removeChild(table); }*/
		}

	// Indent command
	bbcomposer.prototype.doIndentCommand = function ()
		{
		var attributes = new Array();
		var block = this.getSelectedBlock();
		if(block&&(block.tagName.toLowerCase()=='ul'||block.tagName.toLowerCase()=='ol'))
			{
			var element = this.getSelectedElement();
			if(element&&element.tagName.toLowerCase()=='li')
				{
				var newBlock = this.editor.contentDocument.createElement(block.tagName.toLowerCase());
				var newElement = this.editor.contentDocument.createElement('li');
				var newBr = this.editor.contentDocument.createElement('br');
				newElement.textContent='\u00A0';
				newBlock.appendChild(newElement);
				this.doAction({actionFunction: this.insertElement, theElement: newBr, parentElement: element, traceMessage:'doIndentCommand 1'});
				this.doAction({actionFunction: this.insertElement, theElement: newBlock, parentElement: element, focusNode:newElement, traceMessage:'doIndentCommand 2'});
				}
			}
		else if(block)
			{
			var style = new bbcElementStyle((block.hasAttribute('style')?block.getAttribute('style'):''));
			style.setProperty('margin-left',(style.getProperty('margin-left')?parseInt(style.getProperty('margin-left').replace(/([0-9]+)(?:[ ]*)(px|pt|%)/, '$1', 'i'))+20+'px':'20px'));
			this.doAction({'actionFunction':this.updateAttribute,'theElement':block,'theAttribute':'style', 'theValue':style.getCSS(),'focusNode':block,'focusOffset':0, traceMessage:'doIndentCommand 3'});
			}
		}

	bbcomposer.prototype.canUseIndentCommand = function (commandParams)
		{
		if(this.getSelectedBlock())
			return true;
		return false;
		}

	// Deindent command
	bbcomposer.prototype.doDeindentCommand = function ()
		{
		var attributes = new Array();
		var block = this.getSelectedBlock();
		if(block&&(block.tagName.toLowerCase()=='ul'||block.tagName.toLowerCase()=='ol'))
			{
			var element = this.getSelectedElement();
			if(block.parentNode&&block.parentNode.parentNode&&(block.parentNode.parentNode.tagName.toLowerCase()=='ul'||block.parentNode.parentNode.tagName.toLowerCase()=='ol'))
				{
				this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: block, targetElement:block.parentNode.parentNode, nextElement: (block.parentNode.nextSibling?block.parentNode.nextSibling:null), traceMessage:'doDeindentCommand 1'});
				this.doAction({actionFunction: this.removeElement, theElement: block, parentElement: block.parentNode, focusNode:element, traceMessage:'doDeindentCommand 2'});
				}
			}
		else if(block)
			{
			var style = new bbcElementStyle((block.hasAttribute('style')?block.getAttribute('style'):''));
			if(style.getProperty('margin-left')&&parseInt(style.getProperty('margin-left').replace(/([0-9]+)(?:[ ]*)(px|pt|%)/, '$1', 'i'))-20>0)
				{
				style.setProperty('margin-left',parseInt(style.getProperty('margin-left').replace(/([0-9]+)(?:[ ]*)(px|pt|%)/, '$1', 'i'))-20+'px');
				}
			else
				{
				style.setProperty('margin-left','');
				}
			this.doAction({'actionFunction':this.updateAttribute,'theElement':block,'theAttribute':'style', 'theValue':style.getCSS(),'focusNode':block,'focusOffset':0, traceMessage:'doDeindentCommand 3'});
			}
		}

	bbcomposer.prototype.canUseDeindentCommand = function (commandParams)
		{
		var block=this.getSelectedBlock();
		if(block&&(block.tagName.toLowerCase()=='ul'||block.tagName.toLowerCase()=='ol'))
			{
			var element = this.getSelectedElement();
			if(block.parentNode&&block.parentNode.parentNode&&(block.parentNode.parentNode.tagName.toLowerCase()=='ul'||block.parentNode.parentNode.tagName.toLowerCase()=='ol'))
				{
				return true;
				}
			}
		else if(block)
			{
			var style = new bbcElementStyle((block.hasAttribute('style')?block.getAttribute('style'):''));
			if(style.getProperty('margin-left')&&parseInt(style.getProperty('margin-left').replace(/([0-9]+)(?:[ ]*)(px|pt|%)/, '$1', 'i'))>0)
				{
				return true;
				}
			}
		return false;
		}

	// Paste commands
	bbcomposer.prototype.paste = function ()
		{
		this.insertContent(this.myBBComposerManager.getClipboardContent());
		}

	bbcomposer.prototype.pasteIn = function (markup)
		{
		var content = this.myBBComposerManager.getClipboardContent();
		var element = this.editor.contentDocument.createElement(markup);
		if(this.elementIsSuperblock(content))
			{
			while(content.firstChild)
				element.appendChild(content.firstChild);
			content.appendChild(element);
			}
		else
			{
			var block=this.editor.contentDocument.createElement('p');
			while(content.firstChild)
				block.appendChild(content.firstChild);
			content=this.editor.contentDocument.createElement('div');
			content.appendChild(element);
			content.firstChild.appendChild(block);
			}
		this.insertContent(content);
		}

	bbcomposer.prototype.pasteAsText = function ()
		{
		var pastetext = this.myBBComposerManager.getClipboardContentAsText();
		var selection = this.getSelection();
		if(selection&&selection.collapsed)
			{
			var node = selection.focusNode;
			var offset = selection.focusOffset;
			if(node.hasChildNodes()&&offset<node.childNodes.length)
				{
				node=node.childNodes[offset];
				offset=0;
				}
			}
		else
			{
			this.doDeleteSelectionCommand(true);
			this.pasteAsText();
			return true;
			}
		if(node&&this.nodeIsTextnode(node)&&offset!==0&&offset<node.textContent.length)
			{
			this.doAction({actionFunction: this.addTextInTextnode, textNode: node, curOffset: offset, theText:pastetext , focusNode:node, focusOffset:offset+pastetext.length, traceMessage:'pasteAsText 1'});
			}
		else if(node&&this.nodeIsInline(node))
			{
			var newTextNode = this.editor.contentDocument.createTextNode(pastetext);
			this.doAction({actionFunction: this.insertElement, theElement: newTextNode, previousElement: node, focusNode: newTextNode, focusOffset: newTextNode.textContent.length, traceMessage:'pasteAsText 2'});
			}
		else if(node&&this.elementIsBlock(node))
			{
			var newTextNode = this.editor.contentDocument.createTextNode(pastetext);
			this.doAction({actionFunction: this.insertElement, theElement: newTextNode, parentElement: node, focusNode: newTextNode, focusOffset: newTextNode.textContent.length, traceMessage:'pasteAsText 3'});
			}
		else
			{
			var newBlock = this.editor.contentDocument.createElement('p');
			var newTextNode = this.editor.contentDocument.createTextNode(pastetext);
			newBlock.appendChild(newTextNode);
			this.doAction({actionFunction: this.insertElement, theElement: newBlock, parentElement: this.rootElement, focusNode: newTextNode, focusOffset: newTextNode.textContent.length, traceMessage:'pasteAsText 4'});
			}
		return true;
		}

	bbcomposer.prototype.pasteFrom = function (language)
		{
		if(language&&window['bbc'+language.substring(0,1).toUpperCase()+language.substring(1)+'Support'])
			{
			var documentFragment = this.editor.contentDocument.createElement('div');
			var content = window['bbc'+language.substring(0,1).toUpperCase()+language.substring(1)+'Support'].sourceToEditor(this.myBBComposerManager.getClipboardContentAsText());
			documentFragment.innerHTML=content;
			this.sanitizeContent(documentFragment, true);
			this.insertContent(documentFragment);
			}
		}

	bbcomposer.prototype.copy = function ()
		{
		this.myBBComposerManager.copySelectionToClipboard();
		}

	bbcomposer.prototype.cut = function ()
		{
		this.myBBComposerManager.copySelectionToClipboard();
		this.doDeleteSelectionCommand();
		}

	bbcomposer.prototype.drop = function (hEvent)
		{
		var content;
		if(hEvent.dataTransfer)
			{
			if(hEvent.dataTransfer.types.contains("Files"))
				content=this.importFiles(hEvent.dataTransfer.files);
			else if(hEvent.dataTransfer.types.contains("text/x-moz-url"))
				content=this.importContent(hEvent.dataTransfer.getData("text/x-moz-url"),"text/x-moz-url");
			else if(hEvent.dataTransfer.types.contains("text/html"))
				content=this.importContent(hEvent.dataTransfer.getData("text/html"),"text/html");
			else if(hEvent.dataTransfer.types.contains("text/uri-list"))
				content=this.importContent(hEvent.dataTransfer.getData("text/uri-list"),"text/uri-list");
			else if(hEvent.dataTransfer.types.contains("text/unicode"))
				content=this.importContent(hEvent.dataTransfer.getData("text/unicode"),"text/unicode");
			}
		if(content)
			this.insertContent(content,(hEvent.rangeParent?hEvent.rangeParent:null), (hEvent.rangeOffset?hEvent.rangeOffset:null));
		}

	bbcomposer.prototype.setEditorContent = function (content)
		{
		var contents=this.editor.contentDocument.createElement('div');
		contents.innerHTML=content;
		/* Trying to take in count scripts
		var scripts=contents.getElementsByTagName('script');
		for(let i=scripts.length-1; i>=0; i--)
			{
			var replacement=this.editor.contentDocument.createElement('p');
			replacement.setAttribute('class','bbcspecial-script');
			replacement.innerHTML='\u00A0';
			if(scripts[i].hasAttribute('src'))
				{
				//replacement.innerHTML='script src:'+scripts[i].getAttribute('src');
				//replacement.setAttribute('bbcomp','src:'+scripts[i].getAttribute('src'));
				}
			scripts[i].parentNode.insertBefore(replacement,scripts[i]);
			scripts[i].parentNode.removeChild(scripts[i]);
			}*/
		while(this.rootElement.firstChild)
			this.doAction({actionFunction: this.removeElement, theElement:this.rootElement.firstChild, traceMessage:'setEditorContent 1'});
		this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement:contents, targetElement:this.rootElement, focusNode:this.getFirstChildTextnode(this.rootElement), traceMessage:'setEditorContent 2'});
		this.sanitizeContent(this.rootElement, true, true);
		this.doAction({actionFunction: this.doEmptyAction, focusNode:this.getFirstChildTextnode(this.rootElement), focusOffset:0, traceMessage:'setEditorContent 3'});
		}

	bbcomposer.prototype.setContent = function (content, language)
		{
		var content;
		if(content&&language&&language!=this.language)
			content = window['bbc'+language.substring(0,1).toUpperCase()+language.substring(1)+'Support'].sourceToEditor(content);
		else if(content)
			content = this.bbcLanguageSupport.sourceToEditor(content);
		else
			content = this.myBBComposerManager.myBBComposerPreferences.getCharOption('default.content');
		this.setEditorContent(content);
		}

	bbcomposer.prototype.getContent = function (language)
		{
		if(language&&language!=this.language)
			var content = window['bbc'+language.substring(0,1).toUpperCase()+language.substring(1)+'Support'].editorToSource(this.editor.contentDocument.body);
		else
			var content = this.bbcLanguageSupport.editorToSource(this.rootElement);
		return content;
		}

	bbcomposer.prototype.importedFiles=new Array();

	bbcomposer.prototype.importFiles = function (files)
		{
		var newNode, documentFragment;
		for(var i=0,j=files.length; i<j; i++)
			{
			if(/image\/(gif|png|jpg|jpeg)/i.test(files[i].type))
				{
				if(!documentFragment)
					documentFragment=this.editor.contentDocument.createElement('p')
				this.myBBComposerManager.displayStatusText(this.myBBComposerManager.myBBComposerProperties.getString('import_image')+' '+files[i].name);
				newNode = this.editor.contentDocument.createElement('img');
				var src=this.addImportedFile(files[i]);
				newNode.setAttribute('src', src);
				var text=prompt(this.myBBComposerManager.myBBComposerProperties.getString('import_image_alt'), this.myBBComposerManager.myBBComposerProperties.getString('import_image_dalt'));
				newNode.setAttribute('alt', text);
				documentFragment.appendChild(newNode);
				}
			}
		return documentFragment;
		}

	bbcomposer.prototype.importContent = function (data,type)
		{
		var newNode;
		if(type=='text/x-moz-url'||type=='text/unicode')
			{
			var text;
			if(type=='text/x-moz-url')
				{
				var params=data.split(new RegExp('[\r\n]+', 'm'));
				data=params[0];
				if(params[1])
					text=params[1];
				}
			if(/(.+)\.(gif|png|jpg|jpeg)/i.test(data))
				{
				var documentFragment=this.editor.contentDocument.createElement('p');
				this.myBBComposerManager.displayStatusText(this.myBBComposerManager.myBBComposerProperties.getString('import_image')+' '+data);
				newNode = this.editor.contentDocument.createElement('img');
				newNode.setAttribute('src', data);
				if(!text)
					text=prompt(this.myBBComposerManager.myBBComposerProperties.getString('import_image_alt'), this.myBBComposerManager.myBBComposerProperties.getString('import_image_dalt'));
				newNode.setAttribute('alt', text);
				documentFragment.appendChild(newNode);
				}
			else if(/(http|https|ftp):\/\/(.+)/.test(data))
				{
				var documentFragment=this.editor.contentDocument.createElement('p');
				this.myBBComposerManager.displayStatusText(this.myBBComposerManager.myBBComposerProperties.getString('import_link')+' '+data);
				newNode = this.editor.contentDocument.createElement('a');
				newNode.setAttribute('href', data);
				if(!text)
					text=prompt(this.myBBComposerManager.myBBComposerProperties.getString('import_link_text'), this.myBBComposerManager.myBBComposerProperties.getString('import_link_dtext'));
				newNode.setAttribute('title', prompt(this.myBBComposerManager.myBBComposerProperties.getString('import_link_title'), this.myBBComposerManager.myBBComposerProperties.getString('import_link_dtitle')));
				newNode.appendChild(this.editor.contentDocument.createTextNode(text));
				documentFragment.appendChild(newNode);
				}
			else
				{
				this.myBBComposerManager.displayStatusText(this.myBBComposerManager.myBBComposerProperties.getString('import_text')+' '+data);
				if(/[\r\n]+/mg.test(data))
					{
					var documentFragment=this.editor.contentDocument.createElement('div');
					data.trim();
					data = data.replace('&', '&amp;', 'g');
					data = data.replace('>', '&gt;', 'g');
					data = data.replace('<', '&lt;', 'g');
					data = data.replace('	', ' ', 'g');
					data = bbcUtils.doRegExp(data, / ([\s\t]+)/mg, ' ');
					data='<p>'+data+'</p>';
					data = bbcUtils.doRegExp(data, /(\r?\n)(\r?\n)/mg, '</p><p>');
					data = bbcUtils.doRegExp(data, /(\r?\n)/mg, '<br>');
					documentFragment.innerHTML=data;
					}
				else
					{
					var documentFragment=this.editor.contentDocument.createElement('p');
					newNode=this.editor.contentDocument.createTextNode(data);
					documentFragment.appendChild(newNode);
					}
				}
			}
		else if(type=='text/html')
			{
			var documentFragment=this.editor.contentDocument.createElement('div');
			this.myBBComposerManager.displayStatusText(this.myBBComposerManager.myBBComposerProperties.getString('import_html'));
			documentFragment.innerHTML=data
			}
		else
			{
			this.myBBComposerManager.displayStatusText(this.myBBComposerManager.myBBComposerProperties.getString('import_unknown'));
			return null;
			}
		return documentFragment;
		}

	bbcomposer.prototype.insertContent = function (documentFragment, node, offset)
		{
		if(!node)
			{
			var selection = this.getSelection();
			if(!selection.collapsed)
				{
				this.doDeleteSelectionCommand(true);
				selection = this.getSelection();
				}
			node = selection.focusNode;
			offset = selection.focusOffset;
			}
/*		if(offset!==0&&!offset)
			offset=0;
		if(node.hasChildNodes()&&offset<node.childNodes.length)
			{
			node=node.childNodes[offset];
			offset=0;
			}*/

		var blockLevel=false;
		for(var i=documentFragment.childNodes.length-1; i>=0; i--)
			{
			if(this.elementIsBlock(documentFragment.childNodes[i])||this.elementIsSuperblock(documentFragment.childNodes[i])||this.nodeIsListItem(documentFragment.childNodes[i]))
				blockLevel=true;
			}
		documentFragment=this.sanitizeContent(documentFragment,blockLevel);

		var block = this.getParentBlock(node);
		if(blockLevel)
			{
			if(this.nodeIsEmpty(block))
				{
				this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: documentFragment, targetElement: block.parentNode, nextElement:block, traceMessage:'insertContent 1'});
				this.doAction({actionFunction: this.removeElement, theElement:block, focusNode: block.previousSibling, traceMessage:'insertContent 2'});
				}
			else if(this.caretIsAtEndOfInlineContainer()) // should be at end of the block
				{
				this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: documentFragment, previousElement: block, focusNode: documentFragment.lastChild, traceMessage:'insertContent 3'});
				}
			else if(this.caretIsAtBeginOfInlineContainer()) // should be at begin of the block
				{
				this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: documentFragment, nextElement: block, focusNode: documentFragment.lastChild, traceMessage:'insertContent 4'});
				}
			else
				{
				this.splitAtCaretPosition();
				this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: documentFragment, previousElement: block, focusNode: documentFragment.lastChild, traceMessage:'insertContent 5'});
				}
			}
		else
			{
			if(this.nodeIsEmpty(block))
				{
				if(block.firstChild)
					this.doAction({actionFunction: this.removeElement, theElement:block.firstChild, traceMessage:'insertContent 6'});
				this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: documentFragment, targetElement: block, focusNode:documentFragment.firstChild, traceMessage:'insertContent 7'});
				}
			else if(node&&this.nodeIsTextnode(node)&&offset<node.textContent.length)
				{
				if(documentFragment.firstChild==documentFragment.lastChild&&this.nodeIsTextnode(documentFragment.firstChild))
					this.doAction({actionFunction: this.addTextInTextnode, textNode: node, curOffset: offset, theText:documentFragment.firstChild.textContent , focusNode:node, focusOffset:offset+documentFragment.firstChild.textContent.length+1, traceMessage:'insertContent 8'});
				else
					{
					if(offset>0)
						{
						var newTextnode=this.editor.contentDocument.createTextNode(node.textContent.substring(offset));
						this.doAction({actionFunction: this.insertElement, theElement: newTextnode, previousElement: node, traceMessage:'insertContent 9'});
						this.doAction({actionFunction: this.deleteTextInTextnode, textNode: node, curOffset: offset, delLength:node.textContent.length-offset, traceMessage:'insertContent 10'});
						node=newTextnode;
						}
					this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: documentFragment, nextElement: node, focusNode: documentFragment.lastChild, traceMessage:'insertContent 11'});
					}
				}
			else if(node&&this.nodeIsInline(node))
				{
				this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: documentFragment, previousElement: node, focusNode: documentFragment.lastChild, traceMessage:'insertContent 12'});
				}
			else if(node&&this.elementIsBlock(node))
				{
				this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: documentFragment, targetElement: node, focusNode: documentFragment.lastChild, traceMessage:'insertContent 13'});
				}
			else
				{
				var newBlock = this.editor.contentDocument.createElement('p');
				this.doAction({actionFunction: this.exchangeElementChildNodes, sourceElement: documentFragment, targetElement: newBlock, traceMessage:'insertContent 14'});
				this.doAction({actionFunction: this.insertElement, theElement: newBlock, parentElement: this.rootElement, focusNode: newBlock, traceMessage:'insertContent 15'});
				}
			}
		this.checkFiles();
		}

	bbcomposer.prototype.sanitizeContent = function (documentFragment, blockLevel, dontDeletedEmptyNodes)
		{
		documentFragment.innerHTML=documentFragment.innerHTML.replace(this.myBBComposerManager.myBBComposerPreferences.getCharOption('editor.chrome').replace(/(.+)\/([^\/]*)/, '$1/'),this.base);
		var report='';
		var walkerTexasRanger;
		var isModified=false;
		if(blockLevel)
			{
			walkerTexasRanger=document.createTreeWalker(documentFragment, NodeFilter.SHOW_ALL, null, true);
			do
				{
				var element=walkerTexasRanger.currentNode;
				if(element==documentFragment||this.elementIsSuperblock(element))
					{
					for(var i=0; i<element.childNodes.length; i++)
						{
						if((!this.elementIsSuperblock(element.childNodes[i]))&&!this.elementIsBlock(element.childNodes[i]))
							{
							if(this.nodeIsListItem(element.childNodes[i]))
								{
								if(this.checkMarkup(element.childNodes[i].nodeName))
									{
									report+='Orphelin list items detected, creating new list.\n';
									if(element.childNodes[i].nodeName.toLowerCase=='li')
										{
										var newElement = this.editor.contentDocument.createElement('ul');
										}
									else
										{
										var newElement = this.editor.contentDocument.createElement('dl');
										}
									var range = this.editor.contentDocument.createRange();
									range.setStartBefore(element.childNodes[i]);
									while(i<element.childNodes.length&&(this.checkParent(element.childNodes[i].nodeName,newElement.nodeName)))
										i++
									if(i==element.childNodes.length)
										range.setEndAfter(element.lastChild);
									else
										range.setEndBefore(element.childNodes[i]);
									range.surroundContents(newElement);
									}
								else
									{
									while(walkerTexasRanger.currentNode.firstChild)
										walkerTexasRanger.currentNode.parentNode.insertBefore(walkerTexasRanger.currentNode.firstChild,walkerTexasRanger.currentNode);
									element.childNodes[i].parentNode.removeChild(element.childNodes[i]);
									i--;
									}
								}
							else
								{
								report+='Orphelin inline nodes detected, creating new paragraph to contain them.\n';
								var newElement = this.editor.contentDocument.createElement('p');
								var range = this.editor.contentDocument.createRange();
								range.setStartBefore(element.childNodes[i]);
								while(i<element.childNodes.length&&((!this.elementIsSuperblock(element.childNodes[i]))&&!this.elementIsBlock(element.childNodes[i])))
									i++
								if(i==element.childNodes.length)
									range.setEndAfter(element.lastChild);
								else
									range.setEndBefore(element.childNodes[i]);
								range.surroundContents(newElement);
								}
							isModified=true;
							}
						}
					}
				if((!dontDeletedEmptyNodes)&&this.nodeIsEmpty(element))
					{
					element.parentNode.removeChild(element);
					//isModified=true;
					}
				}
			while(walkerTexasRanger.nextNode())
			}
		else if(this.elementIsSuperblock(documentFragment))
			{
			var newDocumentFragment=this.editor.contentDocument.createElement('p');
			while(documentFragment.firstChild)
				newDocumentFragment.appendChild(documentFragment.firstChild);
			documentFragment=newDocumentFragment;
			}
		walkerTexasRanger=document.createTreeWalker(documentFragment, NodeFilter.SHOW_ALL, null, true);
		do
			{
			if(!this.nodeIsTextnode(walkerTexasRanger.currentNode))
				{
				if(walkerTexasRanger.currentNode!=documentFragment&&!this.checkMarkup(walkerTexasRanger.currentNode.nodeName))
					{
					report+='Unauthorized markup:'+walkerTexasRanger.currentNode.nodeName+'\n';
					while(walkerTexasRanger.currentNode.firstChild)
						walkerTexasRanger.currentNode.parentNode.insertBefore(walkerTexasRanger.currentNode.firstChild,walkerTexasRanger.currentNode);
					walkerTexasRanger.currentNode.parentNode.removeChild(walkerTexasRanger.currentNode);
					walkerTexasRanger.currentNode=documentFragment;
					isModified=true;
					}
				else if(walkerTexasRanger.currentNode.parentNode&&walkerTexasRanger.currentNode!=documentFragment&&!this.checkParent(walkerTexasRanger.currentNode.nodeName,walkerTexasRanger.currentNode.parentNode.nodeName))
					{
					report+=walkerTexasRanger.currentNode.nodeName+' markup can\'t be a child of '+walkerTexasRanger.currentNode.parentNode.nodeName+'!\n';
					while(walkerTexasRanger.currentNode.firstChild)
						walkerTexasRanger.currentNode.parentNode.insertBefore(walkerTexasRanger.currentNode.firstChild,walkerTexasRanger.currentNode);
					walkerTexasRanger.currentNode.parentNode.removeChild(walkerTexasRanger.currentNode);
					walkerTexasRanger.currentNode=documentFragment;
					isModified=true;
					}
				else
					{
					for(var i=walkerTexasRanger.currentNode.attributes.length-1; i>=0; i--)
						{
						if(walkerTexasRanger.currentNode.attributes[i]&&!this.checkAttribute(walkerTexasRanger.currentNode.nodeName, walkerTexasRanger.currentNode.attributes[i].name))
							{
							report+='Can\'t set '+walkerTexasRanger.currentNode.attributes[i].name+' attribute to '+walkerTexasRanger.currentNode.nodeName+' markup\n';
							walkerTexasRanger.currentNode.removeAttribute(walkerTexasRanger.currentNode.attributes[i].name);
							i++;
							isModified=true;
							}
						}
					}
				}
			}
		while(walkerTexasRanger.nextNode())
		if(isModified)
			alert(this.myBBComposerManager.myBBComposerProperties.getString('sanitize_alert')+'\n'+report);
		return documentFragment;
		}

	// CSS Commands
	bbcomposer.prototype.cssCommandIsOn = function (commandParams)
		{
		var element = this.getSelectedElement();
		var style = new bbcElementStyle(element.getAttribute('style'));
		if((style.propertyIsset(commandParams[1].replace('_','-'))&&style.getProperty(commandParams[1].replace('_','-'))==commandParams[2])&&((!commandParams[3])||(commandParams[3]=='block'&&this.elementIsBlock(element))||((commandParams[3]=='superblock'&&this.elementIsSuperblock(element)))))
			{
			return true;
			}
		return false;
		}

	bbcomposer.prototype.canUseCssCommand = function (commandParams)
		{
		var element;
		if(commandParams[3]&&commandParams[3]=='superblock')
			element=this.getSelectedSuperblock();
		else if(commandParams[3]&&commandParams[3]=='block')
			element=this.getSelectedBlock();
		else
			element=this.getSelectedElement();
		if(element&&this.checkAttribute(element.nodeName,'style'))
			return true;
		return false;
		}

	bbcomposer.prototype.doCssCommand = function (property, value, level)
		{
		this.setStyleProperty(property.replace('_','-'),value.replace('_','-'),level);
		}

	// CSS num value Commands
	bbcomposer.prototype.numcssCommandIsOn = function (commandParams)
		{
		/*var element = this.getSelectedElement();
		var style = new bbcElementStyle(element.getAttribute('style'));
		if(element&&(style.getProperty(commandParams[4]).replace(/([0-9]+)(?:[ ]*)(px|pt|%)/, '$1', 'i')||commandParams[3]!='decrease'))
			return true;*/
		return false;
		}

	bbcomposer.prototype.canUseNumcssCommand = function (commandParams)
		{
		var element;
		if(commandParams[4]&&commandParams[4]=='superblock')
			element=this.getSelectedSuperblock();
		else if(commandParams[4]&&commandParams[4]=='block')
			element=this.getSelectedBlock();
		else
			element=this.getSelectedElement();
		var style = new bbcElementStyle(element.getAttribute('style'));
		if(element&&(style.getProperty(commandParams[4]).replace(/([0-9]+)(?:[ ]*)(px|pt|%)/, '$1', 'i')||commandParams[3]!='decrease'))
			return true;
		return false;
		}

	bbcomposer.prototype.doNumcssCommand = function (property, dir, pace, level)
		{
		property=property.replace('_','-');
		var element;
		if(level&&level=='superblock')
			element=this.getSelectedSuperblock();
		else if(level&&level=='block')
			element=this.getSelectedBlock();
		else
			element=this.getSelectedElement();
		var style = new bbcElementStyle((element.hasAttribute('style')?element.getAttribute('style'):''));
		var propNumVal;
		if(!pace)
			pace=5;
		if(style.getProperty(property))
			propNumVal=style.getProperty(property).replace(/([0-9]+)(?:[ ]*)(px|pt|%)/, '$1', 'i');
		else
			{
			propNumVal=window.getComputedStyle(element,null).getPropertyValue(property).replace(/([0-9]+)(?:[ ]*)(px|pt|%)/, '$1', 'i');
			propNumVal=propNumVal-(propNumVal%pace);
			}
		if(propNumVal||dir!='decrease')
			{
			if(dir!='decrease')
				propNumVal=(propNumVal*1)+(pace*1);
			else
				propNumVal=propNumVal-pace;
			if(propNumVal>0)
				this.setStyleProperty(property,propNumVal+'px',level);
			else
				this.setStyleProperty(property,'',level);
			}
		}

	// Clean CSS Commands
	bbcomposer.prototype.cleancssCommandIsOn = function (commandParams)
		{
		var element = this.getSelectedElement();
		if(element.hasAttribute('style'))
			{
			return true;
			}
		return false;
		}

	bbcomposer.prototype.canUseCleancssCommand = bbcomposer.prototype.cleancssCommandIsOn;

	bbcomposer.prototype.doCleancssCommand = function ()
		{
		this.resetElementStyle();
		}

	// Fonts Commands
	bbcomposer.prototype.fontsCommandIsOn = function (commandParams)
		{
		var value=this.getStyleProperty('font-family');
		document.getElementById('bbcomposer-fonts-button').value=value;
		return false;
		}

	bbcomposer.prototype.canUseFontsCommand = function (commandParams)
		{
		var element = this.getSelectedElement();
		if(element&&this.checkAttribute(element.nodeName,'style'))
			{
			return true;
			}
		return false;
		}

	bbcomposer.prototype.doFontsCommand = function ()
		{
		this.setStyleProperty('font-family',document.getElementById('bbcomposer-fonts-button').value,'');
		}

	// Color Command
	bbcomposer.prototype.colorCommandIsOn = function (commandParams)
		{
		var value=this.getStyleProperty('color')+'';
		if(value&&value.indexOf('#')!==0)
			value=bbcUtils.rvb2hex(value);
		if(value)
			document.getElementById('bbcomposer-color-button').color=value;
		else
			document.getElementById('bbcomposer-color-button').color='';
		return false;
		}

	bbcomposer.prototype.canUseColorCommand = function (commandParams)
		{
		var element = this.getSelectedElement();
		if(element&&this.checkAttribute(element.nodeName,'style'))
			{
			return true;
			}
		return false;
		}

	bbcomposer.prototype.doColorCommand = function ()
		{
		var value=document.getElementById('bbcomposer-color-button').color+'';
		var value2=this.getStyleProperty('color')+'';
		if(value2&&value2.indexOf('#')!==0)
			value2=bbcUtils.rvb2hex(value2);
		if(value&&value.indexOf('#')!==0)
			value=bbcUtils.rvb2hex(value);
		if(value!=value2)
			{
			this.setStyleProperty('color',value,'');
			}
		}

			/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@
			    EDITOR COMMANDS : END
			@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/


			/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@
			    EDITOR ACTIONS : BEGIN
			@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

	bbcomposer.prototype.registeredActions = new Array();
	bbcomposer.prototype.actionCount = 0;
	bbcomposer.prototype.doAction = function (pSet)
		{
		if(this.registeredActions[this.actionCount-1])
			pSet.previousAction=this.registeredActions[this.actionCount-1];
		pSet.bbcomposer=this;
		var currentAction = pSet.actionFunction();
		if(currentAction)
			{
			if(currentAction.actionFunction) //Old condition, every action functions should return null if no action has been done ! Delete it as soon as possible.
				{
				if(currentAction.focusNode)
					this.setFocusedNode(currentAction.focusNode,(currentAction.focusOffset||currentAction.focusOffset===0?currentAction.focusOffset:false));
				else if(currentAction.selectNode)
					this.setSelectedNode(currentAction.selectNode);
				if(currentAction!=this.registeredActions[this.actionCount-1]&&!currentAction.dontRegister)
					{
					this.registeredActions[this.actionCount]=currentAction;
					this.actionCount++;
					}
				this.emptyActions(this.actionCount);
				this.displayElementInfo();
				}
			else
				alert('hey !');
			}
		}

	bbcomposer.prototype.undoAction = function ()
		{
		var myBool=false;
		while(this.actionCount>0&&this.registeredActions[this.actionCount-1]&&((!myBool)||((!this.registeredActions[this.actionCount-1].selectNode)&&!this.registeredActions[this.actionCount-1].focusNode)))
			{
			myBool=true; // Should be replace by something similar to do->while.
			this.registeredActions[this.actionCount-1].inverseActionFunction();
			this.actionCount--;
			}
		if(this.actionCount&&this.registeredActions[this.actionCount-1])
			{
			if(this.registeredActions[this.actionCount-1].focusNode)
				this.setFocusedNode(this.registeredActions[this.actionCount-1].focusNode,(this.registeredActions[this.actionCount-1].focusOffset?this.registeredActions[this.actionCount-1].focusOffset:null));
			else if(this.registeredActions[this.actionCount-1].selectNode)
				this.setSelectedNode(this.registeredActions[this.actionCount-1].selectNode);
			this.displayElementInfo();
			}
		}

	bbcomposer.prototype.canUseUndoCommand = function (commandParams)
		{
		if(this.actionCount>0)
			return true;
		return false;
		}

	bbcomposer.prototype.redoAction = function ()
		{
		while(this.registeredActions[this.actionCount])
			{
			this.registeredActions[this.actionCount].actionFunction();
			if(this.registeredActions[this.actionCount].focusNode||this.registeredActions[this.actionCount].selectNode)
				break
			this.actionCount++;
			}
		if(this.registeredActions[this.actionCount])
			{
			if(this.registeredActions[this.actionCount].focusNode)
				this.setFocusedNode(this.registeredActions[this.actionCount].focusNode,(this.registeredActions[this.actionCount].focusOffset?this.registeredActions[this.actionCount].focusOffset:null));
			else if(this.registeredActions[this.actionCount].selectNode)
				this.setSelectedNode(this.registeredActions[this.actionCount].selectNode);
			this.actionCount++;
			this.displayElementInfo();
			}
		}

	bbcomposer.prototype.canUseRedoCommand = function (commandParams)
		{
		if(this.actionCount<this.registeredActions.length)
			return true;
		return false;
		}

	bbcomposer.prototype.debug = function ()
		{
		this.displaySelection();
		}

	bbcomposer.prototype.reportCommand = function ()
		{
		var report='';
		for(var i=0; i<this.registeredActions.length; i++)
			{
			if(this.registeredActions[i])
				{
				report+='---------------------------------------------------------\n';
				report+='Action # '+i+'\n';
				if(this.registeredActions[i].focusNode)
					report+='FocusNode: '+this.registeredActions[i].focusNode.nodeName+'\n';
				if(this.registeredActions[i].focusOffset)
					report+='FocusOffset: '+this.registeredActions[i].focusOffset+'\n';
				if(this.registeredActions[i].selectNode)
					report+='SelectNode: '+this.registeredActions[i].selectNode.nodeName+'\n';
				// Text action
				if(this.registeredActions[i].theText)
					report+='TheText: '+this.registeredActions[i].theText+'\n';
				// Element action
				if(this.registeredActions[i].theElement)
					report+='TheElement: '+this.registeredActions[i].theElement.nodeName+'\n';
				if(this.registeredActions[i].debugMessage)
					report+='DebugMessage: '+this.registeredActions[i].debugMessage+'\n';
				if(this.registeredActions[i].traceMessage)
					report+='TraceMessage: '+this.registeredActions[i].traceMessage+'\n';
				}
			}
		this.myBBComposerManager.saveToFile(report);
		alert(report);
		}

	bbcomposer.prototype.canUseReportCommand = function ()
		{
		if(this.actionCount>0)
			return true;
		return false;
		}

	bbcomposer.prototype.emptyActions = function (startIndex)
		{
		for(var i=startIndex; this.registeredActions[this.actionCount]; i++)
			this.registeredActions[this.actionCount]=null;
		}

	bbcomposer.prototype.replaceElement = function ()
		{
		if(this.replacedElement&&this.createdElement)
			{
			this.debugMessage='replaceElement: replacedElement:['+this.replacedElement.nodeName+'] createdElement:['+this.createdElement.nodeName+'] dontCopyContent:['+(this.dontCopyContent?'true':'false')+']';
			if(this.replacedElement.hasChildNodes()&&!this.dontCopyContent)
				{
				while(this.replacedElement.firstChild)
					this.createdElement.appendChild(this.replacedElement.firstChild);
				}
			this.replacedElement.parentNode.replaceChild(this.createdElement,this.replacedElement);
			}
		else
			throw 'BBComposer exception : "replaceElement : An expected parameter is invalid or left (replacedElement&&createdElement) !"'+(this.traceMessage?' Trace:'+this.traceMessage:'');
		this.inverseActionFunction=bbcomposer.prototype.undoReplaceElement;
		return this;
		}

	bbcomposer.prototype.undoReplaceElement = function ()
		{
		if(this.replacedElement&&this.createdElement)
			{
			this.debugMessage='undoReplaceElement: replacedElement:['+this.replacedElement.nodeName+'] createdElement:['+this.createdElement.nodeName+'] dontCopyContent:['+(this.dontCopyContent?'true':'false')+']';
			if(this.createdElement.hasChildNodes()&&!this.dontCopyContent)
				{
				while(this.createdElement.firstChild)
					this.replacedElement.appendChild(this.createdElement.firstChild);
				}
			this.createdElement.parentNode.replaceChild(this.replacedElement,this.createdElement);
			}
		else
			throw 'BBComposer exception : "undoReplaceElement : An expected parameter is invalid or left (replacedElement&&createdElement) !"'+(this.traceMessage?' Trace:'+this.traceMessage:'');
		this.inverseActionFunction=bbcomposer.prototype.replaceElement;
		return this;
		}

	bbcomposer.prototype.exchangeElementChildNodes = function ()
		{
		if(!this.stopAtIndex)
			this.stopAtIndex=this.sourceElement.childNodes.length;
		if(!this.startAtIndex)
			this.startAtIndex=0;
		if(this.startAfter)
			{
			if(this.startAfter.parentNode!=this.sourceElement)
				throw 'BBComposer exception : "exchangeElementChildNodes : The specified startAfter element is not a child of the sourceElement !"';
			for(var i=this.stopAtIndex-1; i>=0; i--)
				if(this.sourceElement.childNodes[i]&&this.startAfter==this.sourceElement.childNodes[i])
					{ this.startAtIndex=i+1; break; }
			}
		if(this.startAt)
			{
			if(this.startAt.parentNode!=this.sourceElement)
				throw 'BBComposer exception : "exchangeElementChildNodes : The specified startAt element is not a child of the sourceElement !"';
			for(var i=this.stopAtIndex-1; i>=0; i--)
				if(this.sourceElement.childNodes[i]&&this.startAt==this.sourceElement.childNodes[i])
					{ this.startAtIndex=i; break; }
			}
		if(this.stopAfter)
			{
			if(this.stopAfter.parentNode!=this.sourceElement)
				throw 'BBComposer exception : "exchangeElementChildNodes : The specified stopAfter element is not a child of the sourceElement !"';
			for(var i=this.stopAtIndex-1; i>=0; i--)
				if(this.sourceElement.childNodes[i]&&this.stopAfter==this.sourceElement.childNodes[i])
					{ this.stopAtIndex=i+1; break; }
			}
		if(this.stopAt)
			{
			if(this.stopAt.parentNode!=this.sourceElement)
				throw 'BBComposer exception : "exchangeElementChildNodes : The specified stopAt element is not a child of the sourceElement !"';
			for(var i=this.stopAtIndex-1; i>=0; i--)
				if(this.sourceElement.childNodes[i]&&this.stopAt==this.sourceElement.childNodes[i])
					{ this.stopAtIndex=i; break; }
			}
		if(this.previousElement)
			{
			if(this.previousElement.nextSibling)
				this.nextElement=this.previousElement.nextSibling;
			else if(!this.targetElement)
				this.targetElement=this.previousElement.parentNode;
			else if(this.previousElement.parentNode!=this.targetElement)
				throw 'BBComposer exception : "exchangeElementChildNodes : The specified previousElement element is not a child of the targetElement !"';
			}
		if(this.nextElement)
			{
			if(!this.targetElement)
				this.targetElement=this.nextElement.parentNode;
			else if(this.nextElement.parentNode!=this.targetElement)
				throw 'BBComposer exception : "exchangeElementChildNodes : The specified nextElement element is not a child of the targetElement !"';
			}
		if(this.exchangeLength>=0)
			{
			this.stopAtIndex=this.startAtIndex+this.exchangeLength;
			}
		if(this.stopAtIndex>this.sourceElement.childNodes.length)
			throw 'BBComposer exception : "exchangeElementChildNodes : Bad stop index !"';
		if(this.startAtIndex>this.sourceElement.childNodes.length)
			throw 'BBComposer exception : "exchangeElementChildNodes : Bad start index !"';
		if(this.sourceElement&&this.targetElement)
			{
			this.debugMessage='exchangeElementChildNodes: sourceElement:['+this.sourceElement.nodeName+'] targetElement:['+this.targetElement.nodeName+'] nextElement:['+(this.nextElement?this.nextElement.nodeName:'')+']';
			if(this.nextElement)
				{
				for(var i=this.startAtIndex; i<this.stopAtIndex; i++)
					this.targetElement.insertBefore(this.sourceElement.childNodes[this.startAtIndex],this.nextElement);
				}
			else
				{
				for(var i=this.startAtIndex; i<this.stopAtIndex; i++)
					this.targetElement.appendChild(this.sourceElement.childNodes[this.startAtIndex]);
				}
			}
		else
			throw 'BBComposer exception : "exchangeElementChildNodes : An expected parameter is invalid or left (sourceElement&&targetElement) !"'+(this.traceMessage?' Trace:'+this.traceMessage:'');
		//alert('s:'+this.startAtIndex+' s'+this.sourceElement.childNodes.length);
		this.inverseActionFunction=this.bbcomposer.undoExchangeElementChildNodes;
		return this;
		}

	bbcomposer.prototype.undoExchangeElementChildNodes = function ()
		{
		if(this.sourceElement&&this.targetElement&&this.stopAtIndex!==null&&this.startAtIndex!==null)
			{
			this.debugMessage='undoExchangeElementChildNodes: sourceElement:['+this.sourceElement.nodeName+'] targetElement:['+this.targetElement.nodeName+'] stopAtIndex:['+this.stopAtIndex+'] startAtIndex:['+this.startAtIndex+']';
			if(this.nextElement)
				{
				for(var i=this.startAtIndex; i<this.stopAtIndex; i++)
					{
					if(this.sourceElement.childNodes[this.startAtIndex])
						this.sourceElement.insertBefore(this.nextElement.previousSibling,this.sourceElement.childNodes[this.startAtIndex]);
					else
						this.sourceElement.appendChild(this.nextElement.previousSibling);
					}
				}
			else
				{
				for(var i=this.startAtIndex; i<this.stopAtIndex; i++)
					{
					if(this.sourceElement.childNodes[this.startAtIndex])
						this.sourceElement.insertBefore(this.targetElement.lastChild,this.sourceElement.childNodes[this.startAtIndex]);
					else
						this.sourceElement.appendChild(this.targetElement.lastChild);
					}
				}
			}
		else
			throw 'BBComposer exception : "undoExchangeElementChildNodes : An expected parameter is invalid or left (sourceElement:"'+this.sourceElement.nodeName+'"&&targetElement:"'+this.targetElement.nodeName+'"&&stopAtIndex:"'+this.stopAtIndex+'"&&startAtIndex:"'+this.startAtIndex+'") !"'+(this.traceMessage?' Trace:'+this.traceMessage:'');
		}
	
	bbcomposer.prototype.insertElement = function ()
		{
		if(this.previousElement)
			{
			if(this.previousElement.nextSibling)
				this.nextElement=this.previousElement.nextSibling;
			else if(this.previousElement.parentNode)
				this.parentElement=this.previousElement.parentNode;
			}
		if(this.theElement&&this.nextElement)
			{
			this.debugMessage='insertElement: theElement:['+this.theElement.nodeName+'] nextElement:['+this.nextElement.nodeName+']';
			this.nextElement.parentNode.insertBefore(this.theElement,this.nextElement);
			}
		else if(this.theElement&&this.parentElement)
			{
			this.debugMessage='insertElement: theElement:['+this.theElement.nodeName+'] parentElement:['+this.parentElement.nodeName+']';
			this.parentElement.appendChild(this.theElement);
			}
		else
			throw 'BBComposer exception : "insertElement : An expected parameter is invalid or left (theElement&&(nextElement||previousElement||parentElement)) !"'+(this.traceMessage?' Trace:'+this.traceMessage:'');
		this.inverseActionFunction=this.bbcomposer.removeElement;
		return this;
		}

	bbcomposer.prototype.removeElement = function ()
		{
		if(this.theElement)
			{
			this.debugMessage='removeElement: theElement:['+this.theElement.nodeName+']';
			if(this.theElement.nextSibling)
				this.nextElement=this.theElement.nextSibling;
			else
				this.parentElement=this.theElement.parentNode;
			this.theElement.parentNode.removeChild(this.theElement);
			}
		else
			throw 'BBComposer exception : "removeElement : An expected parameter is invalid or left (theElement) !"'+(this.traceMessage?' Trace:'+this.traceMessage:'');
		this.inverseActionFunction=this.bbcomposer.insertElement;
		return this;
		}

	bbcomposer.prototype.deleteElement = function ()
		{
		if(this.theElement)
			{
			this.debugMessage='deleteElement: theElement:['+this.theElement.nodeName+']';
			while(this.theElement.parentNode&&this.theElement.parentNode.childNodes.length<2&&this.theElement!=this.bbcomposer.rootElement)
				{
				this.theElement=this.theElement.parentNode;
				}
			if(this.theElement!=this.bbcomposer.rootElement)
				{
				this.calledActionFunction=this.bbcomposer.removeElement;
				this.calledActionFunction();
				this.inverseActionFunction=this.bbcomposer.insertElement;
				}
			else if(this.theElement.childNodes.length<=1&&this.theElement.firstChild&&(this.theElement.firstChild.nodeName.toLowerCase()!='p'
				||this.bbcomposer.nodeIsEmpty(this.theElement.firstChild)))
				{
				this.dontCopyContent=true;
				this.calledActionFunction=this.bbcomposer.replaceElement;
				this.replacedElement=this.theElement.firstChild;
				this.createdElement=this.theElement.ownerDocument.createElement('p');
				this.createdElement.appendChild(this.theElement.ownerDocument.createTextNode('\u00A0'));
				this.calledActionFunction();
				this.inverseActionFunction=this.bbcomposer.undoReplaceElement;
				}
			return this;
			}
		else
			throw 'BBComposer exception : "deleteElement : An expected parameter is invalid or left (theElement) !"'+(this.traceMessage?' Trace:'+this.traceMessage:'');
		}

	bbcomposer.prototype.addTextInTextnode = function ()
		{
		var removed=0;
		var addNbsp=false;
		if((!(this.curOffset||this.curOffset===0))||this.curOffset>this.textNode.textContent.length)
			{
			this.curOffset=this.textNode.textContent.length;
			}
		if(this.textNode.textContent==String.fromCharCode(0xA0))
			{
			this.textNode.textContent='';
			if(this.focusOffset<=1)
				{ this.focusOffset=2; }
			removed++;
			this.curOffset--;
			}
		if(this.curOffset&&this.textNode.textContent[this.curOffset-1]&&this.textNode.textContent[this.curOffset-1]==String.fromCharCode(0xA0))
			{
			if(this.textNode.textContent.length==1)
				{
				this.textNode.textContent='';
				}
			else if(this.curOffset==1)
				{
				this.textNode.textContent=this.textNode.textContent.substring(this.curOffset, this.textNode.textContent.length);
				}
			else if(this.curOffset==this.textNode.textContent.length)
				{
				this.textNode.textContent=this.textNode.textContent.substring(0, this.textNode.textContent.length-1);
				}
			else
				{
				this.textNode.textContent=this.textNode.textContent.substring(0, this.curOffset-1)+this.textNode.textContent.substring(this.curOffset, this.textNode.textContent.length);
				}
			if(this.theText[0]!=' ')
				{
				this.theText=' '+this.theText;
				}
			else
				removed++;
			this.curOffset--;
			}

		if(this.theText&&this.theText[0]==' '&&this.curOffset===0)
			var pDICN = this.bbcomposer.getPreviousDeepestInlineNode(this.textNode);

		if(this.theText&&this.theText[0]==' '
			&&((this.curOffset===0&&this.bbcomposer.getParentBlock(this.textNode)!=this.bbcomposer.getParentBlock(pDICN))
			||(this.textNode.textContent[this.curOffset-1]==' ')))
			{
			if(this.theText.length>1)
				{
				this.theText=this.theText.substring(1,this.theText.length);
				}
			else
				{
				this.theText='';
				}
			removed++;
			}
		if(this.theText&&this.theText[this.theText.length-1]==' ')
			{
			if(this.curOffset==this.textNode.textContent.length)
				{
			/*	if(this.textNode.textContent[this.textNode.textContent.length-1]==String.fromCharCode(0xA0)) // Ou alors espace au cas ou mais ce cas devrait jamais arriver si lediteur filtre bien en entre
					{ alert(5);
					this.theText='';
					removed++;
					}
				else
					{*/
					addNbsp=true;
					// Pas cool ajouter APRES insertion de theText
					if(this.theText.length>1)
						{
						this.theText=this.theText.substring(1,this.theText.length);
						}
					else
						{
						this.theText='';
						}
			/*		}*/
				}
			else if((this.curOffset||this.curOffset===0)&&this.textNode.textContent[this.curOffset]==' ')
				{
				if(this.theText.length>1)
					{
					this.theText=this.theText.substring(0, this.theText.length-2);
					}
				else
					{
					this.theText='';
					}
				//removed++;
				this.curOffset++;
				}
			}
		if(this.focusOffset>=this.curOffset&&removed) { this.focusOffset-=removed; }
		if(this.theText)
			{
			this.debugMessage='addTextInTextNode: theText:['+this.theText+']';
			if(this.curOffset===0)
				this.textNode.textContent=this.theText+this.textNode.textContent;
			else if(this.curOffset>=this.textNode.textContent.length)
				{
				this.textNode.textContent=this.textNode.textContent+this.theText;
				}
			else
				this.textNode.textContent=this.textNode.textContent.substring(0, this.curOffset)+this.theText+this.textNode.textContent.substring(this.curOffset,this.textNode.textContent.length);
			if(addNbsp)
				this.textNode.textContent+=String.fromCharCode(0xA0);
			if(this.previousAction&&this.previousAction.actionFunction==this.actionFunction&&this.previousAction.textNode==this.textNode&&this.previousAction.theText[this.previousAction.theText.length-1]!='\u00A0')
				{
				if(this.curOffset==this.previousAction.curOffset+this.previousAction.theText.length)
					{
					this.previousAction.theText+=this.theText;
					if(this.focusOffset||this.focusOffset===0) { this.previousAction.focusOffset=this.focusOffset; }
					return this.previousAction;
					}
				else if(this.curOffset==this.previousAction.curOffset)
					{
					this.previousAction.theText=this.theText+this.previousAction.theText;
					if(this.focusOffset||this.focusOffset===0) { this.previousAction.focusOffset=this.focusOffset; }
					return this.previousAction;
					}
				}
			}
		else
			{
			if(addNbsp)
				this.textNode.textContent+=String.fromCharCode(0xA0);
			this.actionFunction=this.inverseActionFunction=this.bbcomposer.doEmptyAction;
			this.dontRegister=true;
			return this;
			}
		this.inverseActionFunction=this.bbcomposer.deleteTextInTextnode;
		return this;
		}

	bbcomposer.prototype.deleteTextInTextnode = function ()
		{
		var removed=0;
		if(this.textNode&&(this.theText||this.delLength)&&this.curOffset!==undefined)
			{
			if(this.theText&&!this.delLength)
				this.delLength = this.theText.length;
			if(!this.inverseActionFunction)
				{
				if(this.curOffset+this.delLength==this.textNode.textContent.length&&this.textNode.textContent[this.textNode.textContent.length-1]==String.fromCharCode(0xA0))
					{
					if(this.textNode.textContent.length>1)
						{
						this.textNode.textContent=this.textNode.textContent.substring(0, this.textNode.textContent.length-1);
						}
					else
						{
						this.textNode.textContent='';
						}
					this.delLength--;
					removed++;
					}
				}
			if(this.delLength)
				{
				this.debugMessage='removeTextInTextNode: delLength:['+this.delLength+'] textNode:['+this.textNode.textContent+']';
				this.theText=this.textNode.textContent.substring(this.curOffset,this.curOffset+this.delLength);
				if(this.curOffset+this.delLength<this.textNode.textContent.length)
					{
					this.textNode.textContent=this.textNode.textContent.substring(0, this.curOffset)+this.textNode.textContent.substring(this.curOffset+this.delLength,this.textNode.textContent.length);
					}
				else
					{
					this.textNode.textContent=this.textNode.textContent.substring(0, this.curOffset);
					}
				if(this.textNode.textContent.length<=0)
					{
					this.textNode.textContent='\u00A0';
					}
				if(this.focusOffset>=this.curOffset&&removed) { this.focusOffset-=removed; }
				if((!this.inverseActionFunction)&&this.previousAction&&this.previousAction.actionFunction==this.actionFunction&&this.previousAction.textNode==this.textNode)
					{
					if(this.curOffset+this.delLength==this.previousAction.curOffset)
						{
						this.previousAction.theText=this.theText+this.previousAction.theText;
						this.previousAction.curOffset=this.curOffset;
						this.previousAction.delLength+=this.delLength;
						this.previousAction.focusOffset=this.focusOffset;
						return this.previousAction;
						}
					else if(this.curOffset==this.previousAction.curOffset)
						{
						this.previousAction.theText+=this.theText;
						this.previousAction.delLength+=this.delLength;
						this.previousAction.focusOffset=this.focusOffset;
						return this.previousAction;
						}
					}
				this.inverseActionFunction=this.bbcomposer.addTextInTextnode;
				}
			else
				{
				this.actionFunction=this.inverseActionFunction=this.bbcomposer.doEmptyAction;
				this.dontRegister=true;
				return this;
				}
			return this;
			}
		else
			throw 'BBComposer exception : "deleteTextInTextnode : An expected parameter is invalid or left (textNode&&(theText||delLength)&&curOffset!==undefined) !"'+(this.traceMessage?' Trace:'+this.traceMessage:'');
		}

	bbcomposer.prototype.updateAttribute = function ()
		{
		if(this.theElement&&this.theAttribute)
			{
			if(this.theElement.hasAttributes()&&this.theElement.getAttribute(this.theAttribute))
				this.theOldValue=this.theElement.getAttribute(this.theAttribute);
			if((!this.theValue)&&this.theOldValue)
				this.theElement.removeAttribute(this.theAttribute);
			else if(this.theValue&&this.theValue!=this.oldValue)
				this.theElement.setAttribute(this.theAttribute, this.theValue);
			if((this.theValue&&this.theValue!=this.theOldValue)||((!this.theValue)&&this.theOldValue))
				{
				this.debugMessage='updateAttribute: theElement:['+this.theElement.nodeName+'] theAttribute:['+this.theAttribute+'] theValue:['+this.theValue+'] theOldValue:['+this.theOldValue+']';
				this.inverseActionFunction=this.bbcomposer.updateAttribute;
				this.theValue=this.theOldValue;
				return this;
				}
			else
				{
				this.actionFunction=this.inverseActionFunction=this.bbcomposer.doEmptyAction;
				this.dontRegister=true;
				return this;
				}
			}
		else
			throw 'BBComposer exception : "updateAttribute : An expected parameter is invalid or left (theElement&&theAttribute) !"'+(this.traceMessage?' Trace:'+this.traceMessage:'');
		}

	bbcomposer.prototype.setSelection = function ()
		{
		if(this.focusNode||this.selectNode)
			{
			if(this.previousAction&&this.previousAction.actionFunction==this.actionFunction)
				{
				this.debugMessage='setSelection';
				this.previousAction.focusNode=(this.focusNode?this.focusNode:null);
				this.previousAction.focusOffset=(this.focusNode&&(this.focusOffset||0===this.focusOffset)?this.focusOffset:null);
				this.previousAction.selectNode=(this.selectNode?this.selectNode:null);
				return this.previousAction;
				}
			this.inverseActionFunction=this.bbcomposer.setSelection;
			return this;
			}
		else
			throw 'BBComposer exception : "setSelection : An expected parameter is invalid or left (this.focusNode||this.selectNode) !"'+(this.traceMessage?' Trace:'+this.traceMessage:'');
		}

	bbcomposer.prototype.doEmptyAction = function ()
		{
		this.inverseActionFunction=this.bbcomposer.doEmptyAction;
		return this;
		}

			/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@
			    EDITOR ACTIONS : END
			@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

			/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
			     EDITOR LIMITATIONS : BEGIN
			@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

	bbcomposer.prototype.checkMarkup = function (markup)
		{
		if(this.bbcLanguageSupport.acceptedMarkups[markup.toLowerCase()])
			return true;
		return false;
		}

	bbcomposer.prototype.checkMarkupType = function (markup, type)
		{
		if(this.checkMarkup(markup)&&this.bbcLanguageSupport.acceptedMarkups[markup.toLowerCase()]['type']==type)
			return true;
		return false;
		}

	bbcomposer.prototype.checkChilds = function (markup, childMarkups)
		{
		var x = childMarkups.length;
		for(i=0; i<x; i++)
			{
			if(!this.checkChild(markup.toLowerCase(), childMarkups[i].toLowerCase()))
				return false;
			}
		return true;
		}

	bbcomposer.prototype.checkChild = function (markup, childMarkup)
		{
		if(this.bbcLanguageSupport.acceptedMarkups[markup.toLowerCase()]['childs']&&this.bbcLanguageSupport.acceptedMarkups[markup.toLowerCase()]['childs'].indexOf(childMarkup.toLowerCase())>=0)
			return true;
		return false;
		}

	bbcomposer.prototype.checkParent = function (markup, parentMarkup)
		{
		if(this.bbcLanguageSupport.acceptedMarkups[parentMarkup.toLowerCase()]['childs']&&this.bbcLanguageSupport.acceptedMarkups[parentMarkup.toLowerCase()]['childs'].indexOf(markup.toLowerCase())>=0)
			return true;
		return false;
		}

	bbcomposer.prototype.checkAttribute = function (markup, attribute)
		{
		if(attribute=='class'||attribute=='id'||attribute=='lang'||attribute=='style')
			return true;
		else if(this.bbcLanguageSupport.acceptedMarkups[markup.toLowerCase()]['attributes'])
			{
			for(var i=this.bbcLanguageSupport.acceptedMarkups[markup.toLowerCase()]['attributes'].length-1; i>=0; i--)
				{
				if(this.bbcLanguageSupport.acceptedMarkups[markup.toLowerCase()]['attributes'][i]['name']==attribute)
					return true;
				}
			}
		return false;
		}

	bbcomposer.prototype.checkFertility = function (markup)
		{
		//if(node.nodeName.toLowerCase()=='img'&&node.nodeName.toLowerCase()=='br'&&node.nodeName.toLowerCase()=='hr')
		if(this.bbcLanguageSupport.acceptedMarkups[markup.toLowerCase()]['childs']&&this.bbcLanguageSupport.acceptedMarkups[markup.toLowerCase()]['childs'].length)
			return true;
		return false;
		}

			/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
			     EDITOR LIMITATIONS : END
			@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

			/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@
			       FILE SYSTEM : BEGIN
			@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

	bbcomposer.prototype.save = function ()
		{
		this.myBBComposerManager.saveToFile(this.rootElement.innerHTML);
		}
	bbcomposer.prototype.load = function ()
		{
		var content = this.myBBComposerManager.loadFromFile();
		if(content)
			{
			this.setEditorContent(content);
			}
		}
	bbcomposer.prototype.autoSave = function (andDie)
		{
		if(this.lastSaveAction!=this.registeredActions[this.actionCount-1])
			{
			this.lastSaveAction=this.registeredActions[this.actionCount-1];
			this.myBBComposerManager.displayStatusText(this.myBBComposerManager.myBBComposerProperties.getString('file_saving'));
			this.myBBComposerManager.saveToFile(this.rootElement.innerHTML, true);
			}
		if(!andDie&&this.myBBComposerManager.myBBComposerPreferences.getCharOption('save.delay'))
			this.autoSaveTimeout = window.setTimeout(this.myBBComposerManager.newEventHandler(this, this.autoSave,''), this.myBBComposerManager.myBBComposerPreferences.getCharOption('save.delay'));
		}
	bbcomposer.prototype.backUp = function ()
		{
		var content = this.myBBComposerManager.loadFromFile(true);
		if(content)
			{
			this.setEditorContent(content);
			}
		}

			/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@
			       FILE SYSTEM : END
			@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
			
			/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@
			   FILE FUNCTIONS : BEGIN
			@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

	bbcomposer.prototype.loadingFile = false;

	bbcomposer.prototype.checkFiles = function ()
		{
		if(navigator.onLine&&this.myBBComposerManager.myBBComposerPreferences.getBoolOption('upload.on')&&this.importedFiles.length&&!this.loadingFile)
			{
			this.loadingFile=true;
			var uri=(this.myBBComposerManager.myBBComposerPreferences.getCharOption('upload.site')?this.myBBComposerManager.myBBComposerPreferences.getCharOption('upload.site'):this.base)
				+ "/" + this.myBBComposerManager.myBBComposerPreferences.getCharOption('upload.folder')
				+ this.importedFiles[0].name +'.'+ this.importedFiles[0].ext;
			this._xhr = new XMLHttpRequest();
			this._xhr.open("HEAD", uri);
			this._xhr.addEventListener('readystatechange', this.fileExistsHandler);
			this._xhr.send();
			}
		}

	bbcomposer.prototype.fileExists = function ()
		{
		if (this._xhr.readyState == 4)
			{
			if ((this._xhr.status >= 200 && this._xhr.status <= 200) || this._xhr.status == 304)
				{
				if(this.myBBComposerManager.myBBComposerPreferences.getBoolOption('upload.unique'))
					{
					this.importedFiles[0].name = '_'+this.importedFiles[0].name;
					var range = "abcdefghijklmnopqrstxyz0123456789";
					for(i=0; i<5; i++)
						this.importedFiles[0].name = range.charAt(Math.floor(Math.random() * range.length-2))+this.importedFiles[0].name;
					this.uploadFile();
					}
				else if(window.confirm(this.importedFiles[0].file.name +' '+ this.myBBComposerManager.myBBComposerProperties.getString('file_upload')))
					this.uploadFile();
				else
					{
					this.fileUpdateUri((this.myBBComposerManager.myBBComposerPreferences.getCharOption('upload.site')?this.myBBComposerManager.myBBComposerPreferences.getCharOption('upload.site'):this.base)
						+ "/" + this.myBBComposerManager.myBBComposerPreferences.getCharOption('upload.folder')
						+ (this.importedFiles[0].file.name.replace(new RegExp('(.*)(?:[\.])(?:[^\.]+)','i'),'$1').replace(new RegExp('[^a-z0-9]','gi'),'_'))+'.'+(this.importedFiles[0].file.name.replace(new RegExp('(?:.*)(?:[\.])([^\.]+)','i'),'$1')));
					}
				}
			else
				this.uploadFile();
			}
		}

	bbcomposer.prototype.uploadFile = function ()
		{
		var formData = new FormData();
		var postparams=this.myBBComposerManager.myBBComposerPreferences.getCharOption('upload.postparams').split(/(?:[=\-]{1})/);
		for(var i=0; i<postparams.length; i=i+2)
			{
			formData.append(postparams[i], (postparams[i+1] ? postparams[i+1] : ''));
			}
		formData.append(this.myBBComposerManager.myBBComposerPreferences.getCharOption('upload.postfilename'), this.importedFiles[0].name);
		formData.append(this.myBBComposerManager.myBBComposerPreferences.getCharOption('upload.postname'), this.importedFiles[0].file);
		var uri=(this.myBBComposerManager.myBBComposerPreferences.getCharOption('upload.site')?this.myBBComposerManager.myBBComposerPreferences.getCharOption('upload.site'):this.base) + '/' + this.myBBComposerManager.myBBComposerPreferences.getCharOption('upload.url');
		this._xhr = new XMLHttpRequest();
		this._xhr.open("POST", uri);
		this._xhr.addEventListener('readystatechange', this.fileUploadedHandler);
		this._xhr.send(formData);
		}

	bbcomposer.prototype.fileUploaded = function ()
		{
		if (this._xhr.readyState == 4)
			{
			if ((this._xhr.status >= 200 && this._xhr.status <= 200) || this._xhr.status == 304)
				{
				if (this._xhr.responseText != "")
					{
					var fileName=this.importedFiles[0].file.name;
					if(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.type')=="text")
						{
						if(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.error')!='false'&&new RegExp(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.error')).test(this._xhr.responseText))
							{
							alert(new RegExp(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.notice'), 'mi').exec(this._xhr.responseText)[1]);
							fileName=false;
							}
						if(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.notice')!='false'&&new RegExp(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.notice')).test(this._xhr.responseText))
							{
							alert(new RegExp(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.notice'), 'mi').exec(this._xhr.responseText)[1]);
							}
						if(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.filename')!='false'&&new RegExp(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.filename'), 'mi').test(this._xhr.responseText))
							{
							fileName=new RegExp(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.filename'), 'mi').exec(this._xhr.responseText)[1];
							}
						}
					else
						{
						if(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.error')!='false'&&this._xhr.responseXML.getElementsByTagName(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.error'))[0])
							{
							for(var i=0; i<this._xhr.responseXML.getElementsByTagName(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.error')).length; i++)
								alert(this._xhr.responseXML.getElementsByTagName(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.error'))[i].textContent);
							fileName=false;
							}
						if(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.notice')!='false'&&this._xhr.responseXML.getElementsByTagName(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.notice'))[0])
							{
							for(var i=0; i<this._xhr.responseXML.getElementsByTagName(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.notice')).length; i++)
								alert(this._xhr.responseXML.getElementsByTagName(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.notice'))[i].textContent);
							}
						if(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.filename')!='false'
							&&this._xhr.responseXML.getElementsByTagName(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.filename'))
							&&this._xhr.responseXML.getElementsByTagName(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.filename'))[0])
							{
							fileName=this._xhr.responseXML.getElementsByTagName(this.myBBComposerManager.myBBComposerPreferences.getCharOption('response.filename'))[0].textContent;
							}
						}
					if(fileName)
						{
						this.fileUpdateUri((this.myBBComposerManager.myBBComposerPreferences.getCharOption('upload.site')||this.base) + "/" + this.myBBComposerManager.myBBComposerPreferences.getCharOption('upload.folder') + fileName);
						}
					}
				}
			}
		}

	bbcomposer.prototype.fileUpdateUri = function (uri)
		{
		var images = this.editor.contentDocument.getElementsByTagName('img');
		var x = images.length;
		for(var i=0; i<x; i++)
			{
			if(images[i].src==this.importedFiles[0].uri)
				{
				images[i].setAttribute('src',uri);
				}
			}
		window.URL.revokeObjectURL(this.importedFiles[0].uri);
		this.importedFiles.splice(0,1);
		this.loadingFile=false;
		this.checkFiles();
		}

	bbcomposer.prototype.addImportedFile = function (file)
		{
		var uri=window.URL.createObjectURL(file);
		this.importedFiles.push({'file':file,'uri':uri,
			'name':(file.name.replace(new RegExp('(.*)(?:[\.])(?:[^\.]+)','i'),'$1').replace(new RegExp('[^a-z0-9]+','gi'),'_')).toLowerCase(),
			'ext':file.name.replace(new RegExp('(?:.*)(?:[\.])([^\.]+)','i'),'$1').toLowerCase()});
		return uri;
		}

	bbcomposer.prototype.removeImportedFile = function (uri)
		{
		for(var i=0, j=this.importedFiles.length; i<j; i++)
			{
			if(this.importedFiles[i].uri==uri)
				{
				this.importedFiles.splice(i,1);
				}
			}
		window.URL.revokeObjectURL(uri);
		}

			/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@
			    IMAGES FUNCTIONS : END
			@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

			/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@
			    STYLES FUNCTIONS : BEGIN
			@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

	bbcomposer.prototype.getElementStyle = function (level)
		{
		var element;
		if('block'==level)
			element = this.getSelectedBlock();
		else if('superblock'==level)
			element = this.getSelectedSuperblock();
		else if(!element)
			element = this.getSelectedElement();
		if(element&&element.hasAttribute("style")&&element.getAttribute("style")!="")
			var style = new bbcElementStyle(element.getAttribute("style"));
		else
			var style = new bbcElementStyle('');
		// TEXTS
		if(style.propertyIsset('color'))
			this.myBBComposerManager.sidebar.contentDocument.getElementById('color').color = style.getProperty('color');
		else
			this.myBBComposerManager.sidebar.contentDocument.getElementById('color').color = "transparent";
		this.myBBComposerManager.sidebar.contentDocument.getElementById('font-family').value = style.getProperty('font-family');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('font-size').value = style.getProperty('font-size');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('font-weight').value = style.getProperty('font-weight');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('font-style').value = style.getProperty('font-style');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('text-decoration').value = style.getProperty('text-decoration');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('text-transform').value = style.getProperty('text-transform');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('font-stretch').value = style.getProperty('font-stretch');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('font-variant').value = style.getProperty('font-variant');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('text-align').value = style.getProperty('text-align');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('font-size-adjust').value = style.getProperty('font-size-adjust');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('line-height').value = style.getProperty('line-height');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('text-indent').value = style.getProperty('text-indent');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('word-spacing').value = style.getProperty('word-spacing');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('letter-spacing').value = style.getProperty('letter-spacing');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('white-space').value = style.getProperty('white-space');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('text-shadow').value = style.getProperty('text-shadow');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('direction').value = style.getProperty('direction');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('unicode-bidi').value = style.getProperty('unicode-bidi');
		// MARGIN
		this.myBBComposerManager.sidebar.contentDocument.getElementById('margin-top').value = style.getProperty('margin-top');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('margin-right').value = style.getProperty('margin-right');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('margin-bottom').value = style.getProperty('margin-bottom');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('margin-left').value = style.getProperty('margin-left');
		// PADDING
		this.myBBComposerManager.sidebar.contentDocument.getElementById('padding-top').value = style.getProperty('padding-top');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('padding-right').value = style.getProperty('padding-right');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('padding-bottom').value = style.getProperty('padding-bottom');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('padding-left').value = style.getProperty('padding-left');
		// BACKGROUND
		if(style.propertyIsset('background-color'))
			this.myBBComposerManager.sidebar.contentDocument.getElementById('background-color').color = style.getProperty('background-color');
		else
			this.myBBComposerManager.sidebar.contentDocument.getElementById('background-color').color = "transparent";
		// BORDER
		if(style.propertyIsset('border-color'))
			this.myBBComposerManager.sidebar.contentDocument.getElementById('border-color').color = style.getProperty('border-color');
		else
			this.myBBComposerManager.sidebar.contentDocument.getElementById('border-color').color = "transparent";
		this.myBBComposerManager.sidebar.contentDocument.getElementById('border-width').value = style.getProperty('border-width');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('border-style').value = style.getProperty('border-style');
		// POSITION
		this.myBBComposerManager.sidebar.contentDocument.getElementById('width').value = style.getProperty('width');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('height').value = style.getProperty('height');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('float').value = style.getProperty('float');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('clear').value = style.getProperty('clear');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('position').value = style.getProperty('position');
		this.myBBComposerManager.sidebar.contentDocument.getElementById('visibility').value = style.getProperty('visibility');
		}

	bbcomposer.prototype.setElementStyle = function (level)
		{
		var element;
		if("block"==level)
			element = this.getSelectedBlock();
		else if("superblock"==level)
			element = this.getSelectedSuperblock();
		else if(!element)
			element = this.getSelectedElement();
		if(element&&element.hasAttribute("style")&&element.getAttribute("style")!="")
			var style = new bbcElementStyle(element.getAttribute("style"));
		else
			var style = new bbcElementStyle('');
		if(style)
			{
			// TEXTS
			if((this.myBBComposerManager.sidebar.contentDocument.getElementById('color').color!=""&&this.myBBComposerManager.sidebar.contentDocument.getElementById('color').color!="transparent")||style.propertyIsset('color'))
				style.setProperty('color', this.myBBComposerManager.sidebar.contentDocument.getElementById('color').color);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('font-family').value||style.propertyIsset('font-family'))
				style.setProperty('font-family', this.myBBComposerManager.sidebar.contentDocument.getElementById('font-family').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('font-size').value||style.propertyIsset('font-size'))
				style.setProperty('font-size', this.myBBComposerManager.sidebar.contentDocument.getElementById('font-size').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('text-decoration').value||style.propertyIsset('text-decoration'))
				style.setProperty('text-decoration', this.myBBComposerManager.sidebar.contentDocument.getElementById('text-decoration').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('font-weight').value||style.propertyIsset('font-weight'))
				style.setProperty('font-weight', this.myBBComposerManager.sidebar.contentDocument.getElementById('font-weight').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('font-style').value||style.propertyIsset('font-style'))
				style.setProperty('font-style', this.myBBComposerManager.sidebar.contentDocument.getElementById('font-style').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('text-transform').value||style.propertyIsset('text-transform'))
				style.setProperty('text-transform', this.myBBComposerManager.sidebar.contentDocument.getElementById('text-transform').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('font-stretch').value||style.propertyIsset('font-stretch'))
				style.setProperty('font-stretch', this.myBBComposerManager.sidebar.contentDocument.getElementById('font-stretch').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('font-variant').value||style.propertyIsset('font-variant'))
				style.setProperty('font-variant', this.myBBComposerManager.sidebar.contentDocument.getElementById('font-variant').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('text-align').value||style.propertyIsset('text-align'))
				style.setProperty('text-align', this.myBBComposerManager.sidebar.contentDocument.getElementById('text-align').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('text-indent').value||style.propertyIsset('text-indent'))
				style.setProperty('text-indent', this.myBBComposerManager.sidebar.contentDocument.getElementById('text-indent').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('font-size-adjust').value||style.propertyIsset('font-size-adjust'))
				style.setProperty('font-size-adjust', this.myBBComposerManager.sidebar.contentDocument.getElementById('font-size-adjust').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('line-height').value||style.propertyIsset('line-height'))
				style.setProperty('line-height', this.myBBComposerManager.sidebar.contentDocument.getElementById('line-height').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('word-spacing').value||style.propertyIsset('word-spacing'))
				style.setProperty('word-spacing', this.myBBComposerManager.sidebar.contentDocument.getElementById('word-spacing').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('letter-spacing').value||style.propertyIsset('letter-spacing'))
				style.setProperty('letter-spacing', this.myBBComposerManager.sidebar.contentDocument.getElementById('letter-spacing').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('white-space').value||style.propertyIsset('white-space'))
				style.setProperty('white-space', this.myBBComposerManager.sidebar.contentDocument.getElementById('white-space').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('text-shadow').value||style.propertyIsset('text-shadow'))
				style.setProperty('text-shadow', this.myBBComposerManager.sidebar.contentDocument.getElementById('text-shadow').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('direction').value||style.propertyIsset('direction'))
				style.setProperty('direction', this.myBBComposerManager.sidebar.contentDocument.getElementById('direction').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('unicode-bidi').value||style.propertyIsset('unicode-bidi'))
				style.setProperty('unicode-bidi', this.myBBComposerManager.sidebar.contentDocument.getElementById('unicode-bidi').value);
			// MARGIN
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('margin-top').value||style.propertyIsset('margin-top'))
				style.setProperty('margin-top', this.myBBComposerManager.sidebar.contentDocument.getElementById('margin-top').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('margin-right').value||style.propertyIsset('margin-right'))
				style.setProperty('margin-right', this.myBBComposerManager.sidebar.contentDocument.getElementById('margin-right').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('margin-bottom').value||style.propertyIsset('margin-bottom'))
				style.setProperty('margin-bottom', this.myBBComposerManager.sidebar.contentDocument.getElementById('margin-bottom').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('margin-left').value||style.propertyIsset('margin-left'))
				style.setProperty('margin-left', this.myBBComposerManager.sidebar.contentDocument.getElementById('margin-left').value);
			// PADDING
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('padding-top').value||style.propertyIsset('padding-top'))
				style.setProperty('padding-top', this.myBBComposerManager.sidebar.contentDocument.getElementById('padding-top').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('padding-right').value||style.propertyIsset('padding-right'))
				style.setProperty('padding-right', this.myBBComposerManager.sidebar.contentDocument.getElementById('padding-right').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('padding-bottom').value||style.propertyIsset('padding-bottom'))
				style.setProperty('padding-bottom', this.myBBComposerManager.sidebar.contentDocument.getElementById('padding-bottom').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('padding-left').value||style.propertyIsset('padding-left'))
				style.setProperty('padding-left', this.myBBComposerManager.sidebar.contentDocument.getElementById('padding-left').value);
			// BACKGROUND
			if((this.myBBComposerManager.sidebar.contentDocument.getElementById('background-color').color!=""&&this.myBBComposerManager.sidebar.contentDocument.getElementById('background-color').color!="transparent")||style.propertyIsset('background-color'))
				style.setProperty('background-color', this.myBBComposerManager.sidebar.contentDocument.getElementById('background-color').color);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('background-image').value||style.propertyIsset('background-image'))
				style.setProperty('background-image', this.myBBComposerManager.sidebar.contentDocument.getElementById('background-image').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('background-position').value||style.propertyIsset('background-position'))
				style.setProperty('background-position', this.myBBComposerManager.sidebar.contentDocument.getElementById('background-position').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('background-repeat').value||style.propertyIsset('background-repeat'))
				style.setProperty('background-repeat', this.myBBComposerManager.sidebar.contentDocument.getElementById('background-repeat').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('background-attachment').value||style.propertyIsset('background-attachment'))
				style.setProperty('background-attachment', this.myBBComposerManager.sidebar.contentDocument.getElementById('background-attachment').value);
			// BORDER
			if((this.myBBComposerManager.sidebar.contentDocument.getElementById('border-color').color!=""&&this.myBBComposerManager.sidebar.contentDocument.getElementById('border-color').color!="transparent")||style.propertyIsset('border-color'))
				style.setProperty('border-color', this.myBBComposerManager.sidebar.contentDocument.getElementById('border-color').color);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('border-width').value||style.propertyIsset('border-width'))
				style.setProperty('border-width', this.myBBComposerManager.sidebar.contentDocument.getElementById('border-width').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('border-style').value||style.propertyIsset('border-style'))
				style.setProperty('border-style', this.myBBComposerManager.sidebar.contentDocument.getElementById('border-style').value);
			// POSITION
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('width').value||style.propertyIsset('width'))
				style.setProperty('width', this.myBBComposerManager.sidebar.contentDocument.getElementById('width').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('height').value||style.propertyIsset('height'))
				style.setProperty('height', this.myBBComposerManager.sidebar.contentDocument.getElementById('height').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('float').value||style.propertyIsset('float'))
				style.setProperty('float', this.myBBComposerManager.sidebar.contentDocument.getElementById('float').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('clear').value||style.propertyIsset('clear'))
				style.setProperty('clear', this.myBBComposerManager.sidebar.contentDocument.getElementById('clear').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('position').value||style.propertyIsset('position'))
				style.setProperty('position', this.myBBComposerManager.sidebar.contentDocument.getElementById('position').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('visibility').value||style.propertyIsset('visibility'))
				style.setProperty('visibility', this.myBBComposerManager.sidebar.contentDocument.getElementById('visibility').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('top').value||style.propertyIsset('top'))
				style.setProperty('top', this.myBBComposerManager.sidebar.contentDocument.getElementById('top').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('right').value||style.propertyIsset('right'))
				style.setProperty('right', this.myBBComposerManager.sidebar.contentDocument.getElementById('right').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('bottom').value||style.propertyIsset('bottom'))
				style.setProperty('bottom', this.myBBComposerManager.sidebar.contentDocument.getElementById('bottom').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('left').value||style.propertyIsset('left'))
				style.setProperty('left', this.myBBComposerManager.sidebar.contentDocument.getElementById('left').value);
			if(this.myBBComposerManager.sidebar.contentDocument.getElementById('z-index').value||style.propertyIsset('z-index'))
				style.setProperty('z-index', this.myBBComposerManager.sidebar.contentDocument.getElementById('z-index').value);
			if(element)
				{
				this.doAction({'actionFunction':this.updateAttribute,'theElement':element,'theAttribute':'style','theValue':style.getCSS(),'focusNode':element, traceMessage:'setElementStyle'});
				}
			}
		}

	bbcomposer.prototype.resetElementStyle = function (level)
		{
		var element;
		if('block'==level)
			element = this.getSelectedBlock();
		else if('superblock'==level)
			element = this.getSelectedSuperblock();
		else if(!element)
			element = this.getSelectedElement();
		if(element)
			this.doAction({'actionFunction':this.updateAttribute,'theElement':element,'theAttribute':'style','focusNode':element, traceMessage:'resetElementStyle'});
		this.displayElementInfo();
		}

	bbcomposer.prototype.setStyleProperty = function (property, value, level)
		{
		var element;
		if('block'==level)
			element = this.getSelectedBlock();
		else if('superblock'==level)
			element = this.getSelectedSuperblock();
		else
			element = this.getSelectedElement();
		if(element&&element.hasAttribute("style")&&element.getAttribute("style")!="")
			var style = new bbcElementStyle(element.getAttribute("style"));
		else
			var style = new bbcElementStyle('');
		if(value&&((!style.propertyIsset(property))||style.getProperty(property)!=value))
			style.setProperty(property, value);
		else
			style.setProperty(property, '');
		if(element)
			this.doAction({'actionFunction':this.updateAttribute,'theElement':element,'theAttribute':'style', 'theValue':style.getCSS(),'focusNode':element, traceMessage:'setStyleProperty'});
		}

	bbcomposer.prototype.getStyleProperty = function (property, level)
		{
		var element;
		if('block'==level)
			element = this.getSelectedBlock();
		else if('superblock'==level)
			element = this.getSelectedSuperblock();
		else
			element = this.getSelectedElement();
		if(element&&element.hasAttribute("style")&&element.getAttribute("style")!="")
			var style = new bbcElementStyle(element.getAttribute("style"));
		else
			var style = new bbcElementStyle('');
		if(style.propertyIsset(property))
			{
			return style.getProperty(property);
			}
		else
			return false;
		}

	bbcomposer.prototype.testStyleProperty = function (property, value, level)
		{
		var element;
		if('block'==level)
			element = this.getSelectedBlock();
		else if('superblock'==level)
			element = this.getSelectedSuperblock();
		else
			element = this.getSelectedElement();
		if(element&&element.hasAttribute("style")&&element.getAttribute("style")!="")
			var style = new bbcElementStyle(element.getAttribute("style"));
		else
			var style = new bbcElementStyle('');
		if(style.propertyIsset(property))
			{
			if(style.getProperty(property)==value)
				return true;
			else
				return false;
			}
		else if(!value)
			return true;
		}