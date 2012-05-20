function bbcManager()
	{
	/* UI */
	this.editionPanel = document.getElementById('bbcomposer-panel');
	this.editionSplitter = document.getElementById('bbcomposer-splitter');
	this.editorTabbox = document.getElementById('bbcomposer-tabbox');
	this.sidebar = false;
	this.sidebarName = false;
	this.toolbox = document.getElementById("bbcomposer-toolbox");
	this.toolbarButtons = document.getElementsByClassName('bbcomposer-command-button');
	this.myBBComposerProperties = document.getElementById("bbcomposer-properties");
	/* Core */
	this.myBBComposerPreferences = new ewkOptionService('extensions.bbcomposer@elitwork.com.');
	this.selectedTextarea = false;
	this.selectedLanguage = this.myBBComposerPreferences.getCharOption('default.language');
	this.bbcomposers = new Array();
	this.focusedBBComposer=false;
	/* Events */
	this.initEvents();
	};

	/*------ EVENTS ------*/
	/*------ Events initialization ------*/
	bbcManager.prototype.initEvents = function ()
		{
		// Browser events
		this.browserLoadHandler=this.newEventHandler(this, this.browserLoad,'browserLoadHandler');
		window.getBrowser().addEventListener("load", this.browserLoadHandler, true);
		this.browserPageHideHandler=this.newEventHandler(this, this.browserPageHide,'browserPageHideHandler');
		window.getBrowser().addEventListener("pagehide", this.browserPageHideHandler, true);
		this.browserTabCloseHandler=this.newEventHandler(this, this.browserTabClose,'browserTabCloseHandler');
		window.getBrowser().tabContainer.addEventListener("TabClose", this.browserTabCloseHandler, true);
		this.browserCloseHandler=this.newEventHandler(this, this.browserClose,'browserCloseHandler');
		window.addEventListener("close", this.browserCloseHandler, true);
		this.browserSidebarHandler=this.newEventHandler(this, this.browserSidebarLoad,'browserSidebarHandler');
		window.addEventListener("sidebarload", this.browserSidebarHandler, true);
		// ContentWindow Events
		this.documentSubmitHandler=this.newEventHandler(this, this.documentSubmit,'documentSubmitHandler');
		window.getBrowser().addEventListener("submit", this.documentSubmitHandler, true);
		this.documentDoubleclickHandler=this.newEventHandler(this, this.documentDoubleclick,'documentDoubleclickHandler');
		window.getBrowser().addEventListener("dblclick", this.documentDoubleclickHandler, true);
		this.documentOverHandler=this.newEventHandler(this, this.documentOver,'documentOverHandler');
		window.getBrowser().addEventListener("mouseover", this.documentOverHandler, true);
		// Editor events
		this.editorTabSelectHandler=this.newEventHandler(this, this.editorTabSelect,'editorTabSelectHandler');
		this.editorTabbox.tabs.addEventListener("select", this.editorTabSelectHandler, true);
		//this.editorTabCloseHandler=this.newEventHandler(this, this.editorTabClose,'editorTabCloseHandler');
		//this.editorTabbox.tabs.addEventListener("close", this.editorTabCloseHandler, true);
		}

	bbcManager.prototype.newEventHandler = function (obj,method,handler)
		{
		var fx = method;
		if(handler)
			{
			window[handler] = function () { return fx.apply(obj, arguments); };
			return window[handler];
			}
		return function () { return fx.apply(obj, arguments); }
		}

	/*------ Browser events ------*/
	bbcManager.prototype.browserLoad = function (hEvent)
		{
		if(hEvent.target.nodeName.toLowerCase()=='#document')
			{
			var textareas;
			for(var k=window.frames.length-1; k>-1; k--)
				{
				textareas = window.frames[k].document.getElementsByTagName('textarea');
				for(var i=textareas.length-1; i>-1; i--)
					{
					if(!textareas[i].disabled)
						{
						var language = this.getSavedLanguageForTextarea(textareas[i]);
						if(language)
							{
							if(this.myBBComposerPreferences.getBoolOption('autodetect'))
								{
								this.toggleEditor(language, textareas[i]);
								}
							}
						}
					}
				}
			return false;
			}
		return false;
		}
	bbcManager.prototype.browserSidebarLoad = function (hEvent)
		{
		if(hEvent&&hEvent.sidebarName)
			{
			this.toggleSidebar(hEvent.sidebarName,true,hEvent.standAlone);
			if(hEvent.sidebarWindow&&hEvent.sidebarWindow.run)
				hEvent.sidebarWindow.run(this);
			}
		else
			this.toggleSidebar('',false);
		}

	/*------ Document events ------*/
	bbcManager.prototype.documentDoubleclick = function (hEvent)
		{
		var element=hEvent.target;
		if(element.nodeName.toLowerCase()=='textarea')
			{
			if(element.disabled)
				{
				this.focusEditorForTextarea(element);
				}
			else
				{
				var language=this.getSavedLanguageForTextarea(element);
				if(language)
					this.toggleEditor(language, element);
				}
			}
		}
	bbcManager.prototype.documentOver = function (hEvent)
		{
		var element=hEvent.target;
		if(element.nodeName.toLowerCase()=='textarea')
			{
			if(element.disabled)
				{
				this.displayStatusText(this.myBBComposerProperties.getString('doubleclick_view'));
				}
			else
				{
				var language=this.getSavedLanguageForTextarea(element);
				if(language)
					this.displayStatusText(this.myBBComposerProperties.getString('doubleclick_edit')+' '+language);
				}
			}
		}
	bbcManager.prototype.documentSubmit = function (hEvent)
		{
		var textareas=hEvent.target.getElementsByTagName('textarea');
		for(var j=textareas.length-1; j>-1; j--)
			{
			for (var i=this.bbcomposers.length-1; i>-1 ; i--)
				{
				if(this.bbcomposers[i].textarea==textareas[j])
					{
					this.closeBBComposer(this.bbcomposers[i],!confirm(this.myBBComposerProperties.getString('submit_alert')));
					}
				}
			}
		}

	/*------ Editor events ------*/
	bbcManager.prototype.editorTabClose = function (hEvent)
		{
		for (var i=this.bbcomposers.length-1; i>-1 ; i--)
			{
			if(this.bbcomposers[i].linkedTab==this.editorTabbox.selectedTab)
				{
				this.closeBBComposer(this.bbcomposers[i]);
				return true;
				}
			}
		}
	bbcManager.prototype.editorTabSelect = function (hEvent)
		{
		for (var i=this.bbcomposers.length-1; i>-1; i--)
			{
			if(this.bbcomposers[i].linkedTab==this.editorTabbox.selectedTab)
				{
				this.setFocusedBBComposer(this.bbcomposers[i]);
				return true;
				}
			}
		}

	/*------ Textareas informations ------*/
	bbcManager.prototype.getSavedLanguageForTextarea = function (textarea)
		{
		if(textarea.hasAttribute('id')) //&&this.myBBComposerPreferences.getBoolOption('autodetect')&&(window.frames[k].document==window.getBrowser().contentDocument))
			{
			var current_site = textarea.ownerDocument.location.href.replace(/(.+)\/([^\/]*)/, '$1/');
			for(var j=0; this.myBBComposerPreferences.defaultOptionIsset('fields.'+j)&&this.myBBComposerPreferences.getCharOption('fields.'+j).length!=0; j++)
				{
				var curPref = this.myBBComposerPreferences.getArrayOption('fields.'+j);
				if(new RegExp(curPref[0]).test(current_site)&&new RegExp(curPref[1]).test(textarea.getAttribute('id')))
					{
					return curPref[2];
					}
				}
			}
		return false;
		}
	bbcManager.prototype.focusEditorForTextarea = function (textarea)
		{
		for (var i=this.bbcomposers.length-1; i>-1 ; i--)
			{
			if(this.bbcomposers[i].textarea==textarea)
				{
				this.setFocusedBBComposer(this.bbcomposers[i]);
				break;
				}
			}
		}

	/*------ UI functions ------*/
	bbcManager.prototype.toggleUI = function (command)
		{
		if(command=="show"||(this.editionPanel.collapsed&&command!='hide'))
			{
			if(this.sidebarName)
				this.toggleSidebar(this.sidebarName,true);
			this.toggleToolbarButtons(true);
			this.toggleToolbarButtons(false);
			var curToolbarName;
			for(var i=this.toolbox.childNodes.length-1; i>=0; i--)
				{
				curToolbarName=this.toolbox.childNodes[i].getAttribute('id').replace(/^bbcomposer-([a-z]+)-toolbar$/, '$1');
				if(curToolbarName!='gestion')
					this.toggleToolbar(curToolbarName,true,true);
				}
			this.editorTabbox.tabpanels.selectedPanel=this.focusedBBComposer.editor.parentNode;
			this.editorTabbox.tabs.selectedIndex=this.editorTabbox.tabpanels.selectedIndex;
			this.editionSplitter.collapsed = false;
			this.editionPanel.collapsed = false;
			}
		else
			{
			this.editionSplitter.collapsed = true;
			this.editionPanel.collapsed = true;
			if(this.sidebar)
				this.toggleSidebar('',false);
			for(var i=this.toolbox.childNodes.length-1; i>=0; i--)
				{
				curToolbarName=this.toolbox.childNodes[i].getAttribute('id').replace(/^bbcomposer-([a-z]+)-toolbar$/, '$1');
				if(curToolbarName!='gestion')
					this.toggleToolbar(curToolbarName,false);
				}
			this.toggleToolbarButtons(true);
			}
		}

	bbcManager.prototype.updateUI = function ()
		{
		var element = this.focusedBBComposer.getSelectedElement();
		/*
		this.editor.contentWindow
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIWebNavigation)
			.QueryInterface(Components.interfaces.nsIDocShell)
			.contentViewer
			.QueryInterface(Components.interfaces.nsIMarkupDocumentViewer)
			.scrollToNode(element);
		//this.editor.contentDocument.getBoxObjectFor(element).QueryInterface(Components.interfaces.nsIScrollBoxObject).ensureElementIsVisible(element);
		//getBoundingClientRect(this.editor).QueryInterface(Components.interfaces.nsIScrollBoxObject).ensureElementIsVisible(element);
		this.editor.contentWindow
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIWebNavigation)
			.QueryInterface(Components.interfaces.nsIDocShell)
			.contentViewer
			.QueryInterface(Components.interfaces.nsIMarkupDocumentViewer)
			.scrollToNode(element);*/
		if(element&&element.offsetHeight<this.focusedBBComposer.editor.contentWindow.innerHeight)
			{
			var rectEditor=this.focusedBBComposer.editor.getBoundingClientRect();
			var rectElement=element.getBoundingClientRect();
			if(rectElement.bottom>rectEditor.bottom-rectEditor.top&&rectElement.top>0)
				{
				this.focusedBBComposer.editor.contentWindow.scrollTo(0,this.focusedBBComposer.editor.contentWindow.pageYOffset+(rectElement.bottom-Math.abs(rectEditor.bottom-rectEditor.top)));
				}
			else if(rectElement.top<0&&rectElement.bottom<rectEditor.bottom-rectEditor.top)
				{
				this.focusedBBComposer.editor.contentWindow.scrollTo(0,this.focusedBBComposer.editor.contentWindow.pageYOffset+rectElement.top);
				}
			}
		this.uncheckToolbarButtons();
		if(element)
			{
			for(var i=this.toolbarButtons.length-1; i>=0; i--)
				{
				if(this.toolbarButtons[i].hasAttribute('command')&&this.focusedBBComposer.canUseCommand(this.toolbarButtons[i].getAttribute('command'), element))
					{
					this.toolbarButtons[i].disabled=false;
					if(this.focusedBBComposer.commandIsOn(this.toolbarButtons[i].getAttribute('command'), element))
						{
						this.ckeckToolbarButton(this.toolbarButtons[i].getAttribute('id').replace(/bbcomposer-(.*)-button/,'$1'));
						}
					}
				else
					{
					this.toolbarButtons[i].disabled=true;
					}
				}
			}
		// Display sidebar content
		if(this.sidebar&&typeof this[this.sidebarName + 'Display'] == 'function') // Remove soon
			this[this.sidebarName + 'Display'](); // Remove soon
			
		if(this.sidebar&&this.sidebar.contentDocument)
			{
			var evt = this.sidebar.contentDocument.createEvent('Event');
			evt.initEvent('display', true, true);
			evt.selectedElement=element;
			evt.editorManager=this;
			this.sidebar.contentDocument.dispatchEvent(evt);
			}
		// Display status text
		var statustext='';
		if(element && element!=this.focusedBBComposer.rootElement.parentNode)
			{
			var j=0;
			while(element && element!=this.focusedBBComposer.rootElement.parentNode)
				{
				if(j>0)
					statustext = " > " + statustext;
				statustext = element.nodeName.toLowerCase() + (element.hasAttribute('id')?'#'+element.getAttribute('id'):'') + (element.hasAttribute('class')?'.'+(element.getAttribute('class').split(' ').join('.')):'') + statustext;
				element = element.parentNode;
				j++;
				}
			}
		else
			statustext="body";
		this.displayStatusText(statustext);
		
		var selectedBlock = this.focusedBBComposer.getSelectedBlock();
		this.checkBlockButton((selectedBlock?selectedBlock.tagName.toLowerCase():null));
		if(this.myBBComposerPreferences.getBoolOption('spellchecker'))
			this.refreshSpellcheck();
		document.commandDispatcher.focusedWindow=this.focusedBBComposer.editor.contentWindow;
		}

	/*------ Browser events functions ------*/
	bbcManager.prototype.browserTabClose = function (hEvent)
		{
		var curBrowser = window.getBrowser().getBrowserForTab(hEvent.target);
		for (var i=this.bbcomposers.length-1; i>-1 ; i--)
			{
			if(this.bbcomposers[i]&&curBrowser.contentDocument==this.bbcomposers[i].document)
				{
				this.closeBBComposer(this.bbcomposers[i],true);
				}
			}
		if(window.getBrowser().tabContainer.childNodes.length<=1) { window.getBrowser().addTab(); }
		}

	bbcManager.prototype.browserPageHide = function (hEvent)
		{
		if(hEvent.target.nodeName.toLowerCase()=='#document')
			{
			for (var i=this.bbcomposers.length-1; i>-1 ; i--)
				{
				if(this.bbcomposers[i]&&this.bbcomposers[i].document==hEvent.target)
					{
					this.closeBBComposer(this.bbcomposers[i],true);
					}
				}
			if(this.selectedTextarea&&this.selectedTextarea.ownerDocument==hEvent.target)
				this.selectedTextarea=false;
			}
		}

	bbcManager.prototype.browserClose = function (hEvent)
		{
		for (var i=this.bbcomposers.length-1; i>-1 ; i--)
			{
			if(this.bbcomposers[i])
				this.closeBBComposer(this.bbcomposers[i]);
			}
		this.toggleSidebar('',false)
		}

	bbcManager.prototype.menuPopup = function (menupopup)
		{
		var language='';
		if(gContextMenu&&gContextMenu.target&&gContextMenu.target.disabled==false)
			{
			this.selectedTextarea=gContextMenu.target;
			language=this.getSavedLanguageForTextarea(this.selectedTextarea);
			if(!language)
				{
				if((!this.focusedBBComposer)||!this.focusedBBComposer.language)
					{
					language = this.myBBComposerPreferences.getCharOption('default.language');
					}
				else
					language = this.focusedBBComposer.language;
				}
			}
		else { this.selectedTextarea=false; }

		var x = menupopup.childNodes.length;
		for(var i=0; i<x; i++)
			{
			menupopup.childNodes[i].setAttribute('disabled',(this.selectedTextarea?false:true));
			if(menupopup.childNodes[i].getAttribute('id')=='bbcomposer-'+language+'-context') {  menupopup.childNodes[i].setAttribute('checked',true); }
			else {  menupopup.childNodes[i].setAttribute('checked',false); }
			}
		}

	/*------ BBComposer management ------*/
	bbcManager.prototype.setFocusedBBComposer = function (bbcomposer)
		{
		if(this.bbcomposers.length==0)
			{
			this.toggleUI("hide");
			this.focusedBBComposer=null;
			}
		else if(this.focusedBBComposer!=bbcomposer)
			{
			this.focusedBBComposer=(bbcomposer?bbcomposer:this.bbcomposers[0]);
			this.toggleUI('show');
			this.focusedBBComposer.displayElementInfo();
			}
		}

	bbcManager.prototype.closeBBComposer = function (closedBBComposer, cancelChanges)
		{
		window.removeEventListener("load", this.browserLoadHandler, true);
		if(!cancelChanges)
			{
			closedBBComposer.textarea.value = closedBBComposer.getContent();
			}
		closedBBComposer.unInit();
		closedBBComposer.textarea.disabled=false;
		closedBBComposer.editor.parentNode.parentNode.removeChild(closedBBComposer.editor.parentNode);
		closedBBComposer.linkedTab.parentNode.removeChild(closedBBComposer.linkedTab);
		for(var i=this.bbcomposers.length-1; i>-1; i--)
			{
			if(this.bbcomposers[i]==closedBBComposer)
				{
				this.bbcomposers=(i>0?this.bbcomposers.slice(0,i):[]).concat((i<this.bbcomposers.length-1?this.bbcomposers.slice(i+1):[]));
				break;
				}
			}
		this.setFocusedBBComposer(null);
		window.addEventListener("load", this.browserLoadHandler, true);

		}

	bbcManager.prototype.createBBComposer = function (language, textarea)
		{
		var label=this.myBBComposerProperties.getString('textarea_dlabel');
		if(textarea.hasAttribute('id')&&textarea.getAttribute('id'))
			{
			var labels = textarea.ownerDocument.getElementsByTagName('label');
			for(var i=labels.length-1; i>=0; i--)
				{
				if(textarea.getAttribute('id')==labels[i].getAttribute('for'))
					label=labels[i].textContent;
				}
			}
		var editorHref = this.myBBComposerPreferences.getCharOption('editor.chrome');
		var editorTab = document.createElement('tab');
		editorTab.setAttribute('label', label + (textarea.ownerDocument.domain?'-'+textarea.ownerDocument.domain:''));
		var editorTabPanel = document.createElement('tabpanel');
		var editorFrame = document.createElement('iframe');
		editorFrame.setAttribute('context','bbcomposerContextMenu');
		editorFrame.setAttribute('type','content');
		editorFrame.setAttribute('src',editorHref);
		editorFrame.setAttribute('flex', 1);
		editorTabPanel.appendChild(editorFrame);
		this.editorTabbox.tabpanels.appendChild(editorTabPanel);
		this.editorTabbox.tabs.appendChild(editorTab);
		var newBBComposer = new bbcomposer(editorFrame, language, textarea, this);
		newBBComposer.linkedTab=editorTab;
		this.bbcomposers[this.bbcomposers.length] = newBBComposer;
		textarea.disabled=true;
		this.setFocusedBBComposer(newBBComposer);
		}

	bbcManager.prototype.toggleEditor = function (language, textarea)
		{
		if(!textarea)
			textarea=this.selectedTextarea;
		if(!language)
			language = this.selectedLanguage;
		if(language&&textarea&&textarea.parentNode&&textarea.disabled==false)
			{
			this.createBBComposer(language, textarea);
			}
		}

	/*------ Toolbar button functions ------*/
	bbcManager.prototype.toggleToolbarButtons = function (disableAll)
		{
		if(!(this.focusedBBComposer&&this.focusedBBComposer.bbcLanguageSupport))
			disableAll=true;
		// Buttons
		for(var i=this.toolbarButtons.length-1; i>=0; i--)
			{
			this.toolbarButtons[i].disabled=true;
			if(disableAll||!(this.focusedBBComposer.bbcLanguageSupport.allowedButtons&&this.focusedBBComposer.bbcLanguageSupport.allowedButtons.indexOf(this.toolbarButtons[i].getAttribute('id').replace(/^bbcomposer-([a-z0-9\-_]+)-button$/,'$1'))>=0))
				{
				this.toolbarButtons[i].hidden=true;
				}
			else
				{
				this.toolbarButtons[i].hidden=false;
				}
			}
		// Blocks menulist
		var blockButtons=document.getElementById('bbcomposer-blocks-button').getElementsByTagName('menuitem');
		for(i=blockButtons.length-1; i>=0; i--)
			{
			if(disableAll||!(this.focusedBBComposer.bbcLanguageSupport.allowedBlocks&&this.focusedBBComposer.bbcLanguageSupport.allowedBlocks.indexOf(blockButtons[i].value)>=0))
				{
				blockButtons[i].hidden=true;
				blockButtons[i].disabled=true;
				}
			else
				{
				blockButtons[i].hidden=false;
				blockButtons[i].disabled=false;
				}
			}
		}

	bbcManager.prototype.uncheckToolbarButtons = function ()
		{
		var buttons = this.toolbox.getElementsByTagName('toolbarbutton');
		for(var i=this.toolbarButtons.length-1; i>=0; i--)
			{
			if(!this.toolbarButtons[i].hidden)
				this.toolbarButtons[i].checked = false;
			}
		}

	bbcManager.prototype.ckeckToolbarButton = function (name)
		{
		if(document.getElementById('bbcomposer-' + name + '-button'))
			document.getElementById('bbcomposer-' + name + '-button').checked=true;
		}

	bbcManager.prototype.buttonIsOnToolbar = function (name)
		{
		var button=document.getElementById('bbcomposer-' + name + '-button');
		if(button)
			return !button.hidden;
		else
			return false;
		}

	bbcManager.prototype.checkBlockButton = function (markup)
		{
		document.getElementById('bbcomposer-blocks-button').value = markup;
		}

	/*------ Toolbar functions ------*/
	bbcManager.prototype.toggleToolbar = function (toolbarName, showState, testDisplayRule)
		{
		var toolbar=document.getElementById('bbcomposer-'+toolbarName+'-toolbar');
		if((showState===true||(toolbar.collapsed&&showState!==false))&&this.toolbarIsAllowed(toolbarName)&&(testDisplayRule!==true||this.toolbarIsDisplayed(toolbarName)))
			toolbar.collapsed = false;
		else
			toolbar.collapsed = true;
		}

	bbcManager.prototype.toolbarMenuPopup = function (menupopup)
		{
		var curToolbarName;
		for(var i=0; i<menupopup.childNodes.length; i++)
			{
			curToolbarName=menupopup.childNodes[i].getAttribute('id').replace(/^bbcomposer-([a-z]+)-toolbar-button$/, '$1');
			if(this.focusedBBComposer&&this.focusedBBComposer.bbcLanguageSupport&&this.toolbarIsAllowed(curToolbarName))
				{
				menupopup.childNodes[i].setAttribute("disabled", false);
				if(!document.getElementById('bbcomposer-'+curToolbarName+'-toolbar').collapsed)
					{
					menupopup.childNodes[i].setAttribute("checked", true);
					}
				else
					{
					menupopup.childNodes[i].setAttribute("checked", false);
					}
				}
			else
				{
				menupopup.childNodes[i].setAttribute("checked", false);
				menupopup.childNodes[i].setAttribute("disabled", true);	
				}
			}
		}

	bbcManager.prototype.toolbarIsAllowed = function (toolbarName)
		{
		if(this.focusedBBComposer&&this.focusedBBComposer.bbcLanguageSupport&&this.focusedBBComposer.bbcLanguageSupport.allowedToolbars)
			{
			for(var i=this.focusedBBComposer.bbcLanguageSupport.allowedToolbars.length-1; i>=0; i--)
				if(toolbarName==this.focusedBBComposer.bbcLanguageSupport.allowedToolbars[i])
					return true;
			}
		return false;
		}

	bbcManager.prototype.toolbarIsDisplayed = function (toolbarName)
		{
		if(this.focusedBBComposer&&this.focusedBBComposer.bbcLanguageSupport&&this.focusedBBComposer.bbcLanguageSupport.displayedToolbars)
			{
			for(var i=this.focusedBBComposer.bbcLanguageSupport.displayedToolbars.length-1; i>=0; i--)
				if(toolbarName==this.focusedBBComposer.bbcLanguageSupport.displayedToolbars[i])
					return true;
			}
		return false;
		}

	/*------ Sidebar functions ------*/
	bbcManager.prototype.toggleSidebar = function (sidebarName, showState, standAlone)
		{
		if(showState===false||((!standAlone)&&!this.sidebarIsAllowed(sidebarName))||(this.sidebar&&this.sidebarName==sidebarName&&showState!==true)&&(document.getElementById('bbcomp-' + sidebarName + '-sidebar')||document.getElementById(sidebarName + '-sidebar')))
			{
			this.sidebar = false;
			this.sidebarName = false;
			if(!document.getElementById("sidebar").hidden)
				toggleSidebar("", false);
			}
		else if(showState===true||((!this.sidebar)&&showState!==false)||(!this.sidebar.hasAttribute('id'))||(this.sidebar.getAttribute('id')!='bbcomp-' + sidebarName + '-sidebar'&&this.sidebar.getAttribute('id')!=sidebarName + '-sidebar'))
			{
			this.sidebar = document.getElementById("sidebar");
			this.sidebarName = sidebarName;
			document.getElementById("sidebar").hidden = false;
			if(document.getElementById(sidebarName + '-sidebar'))
				toggleSidebar(sidebarName + '-sidebar', true);
			else
				toggleSidebar('bbcomp-' + sidebarName + '-sidebar', true);
			return true;
			}
		return false;
		}

	bbcManager.prototype.sidebarIsAllowed = function (sidebarName)
		{
		if(this.focusedBBComposer&&this.focusedBBComposer.bbcLanguageSupport&&this.focusedBBComposer.bbcLanguageSupport.allowedSidebars)
			{
			for(var i=this.focusedBBComposer.bbcLanguageSupport.allowedSidebars.length-1; i>=0; i--)
				if(sidebarName==this.focusedBBComposer.bbcLanguageSupport.allowedSidebars[i])
					return true;
			}
		return false;
		}

	bbcManager.prototype.sidebarIsDisplayed = function (sidebarName)
		{
		if(this.focusedBBComposer&&this.focusedBBComposer.bbcLanguageSupport&&this.focusedBBComposer.bbcLanguageSupport.displayedSidebars)
			{
			for(var i=this.focusedBBComposer.bbcLanguageSupport.displayedSidebars.length-1; i>=0; i--)
				if(sidebarName==this.focusedBBComposer.bbcLanguageSupport.displayedSidebars[i])
					return true;
			}
		return false;
		}

	bbcManager.prototype.sidebarMenuPopup = function (menupopup)
		{
		for(var i=0; i<menupopup.childNodes.length; i++)
			{
			if(this.sidebarIsAllowed(menupopup.childNodes[i].getAttribute('id').replace(/(?:bbcomposer-|)([a-z]+)-sidebar-(?:[a-z]+)/, '$1')))
				menupopup.childNodes[i].setAttribute("disabled", false);
			else
				menupopup.childNodes[i].setAttribute("disabled", true);	
			}
		}

	/*------ Remember fields functions ------*/
	bbcManager.prototype.remember = function ()
		{
		if(this.selectedTextarea)
			{
			if(this.selectedTextarea.hasAttribute('id')&&this.selectedTextarea.getAttribute('id'))
				{
				var params = this.openPopupDialog('save', new Array('(.*)'+window.getBrowser().contentDocument.location.href.replace(/(?:http|ftp|https):\/\/([^\/]+)(?:.*)/, '$1')+'(.*)',this.selectedTextarea.getAttribute('id'),this.myBBComposerPreferences.getCharOption('default.language')));
				if(params.length)
					{
					this.addField(params);
					this.selectedLanguage=params[2];
					this.toggleEditor();
					}
				}
			else
				alert(this.myBBComposerManager.myBBComposerProperties.getString('textarea_alert'));
			}
		}

	bbcManager.prototype.addField = function (params)
		{
		for(var i=0; this.myBBComposerPreferences.defaultOptionIsset('fields.'+i)&&this.myBBComposerPreferences.getCharOption('fields.'+i).length!=0; i++)
			{	}
		this.myBBComposerPreferences.setArrayOption('fields.'+i, params);
		this.myBBComposerPreferences.saveOptions();
		}

	/*------ Other functions ------*/
	bbcManager.prototype.goToURLWithOptions = function (url)
		{
		if(this.myBBComposerPreferences.getCharOption('link.target')=='tab')
			var newTab = window.getBrowser().addTab(url);
		else if(this.myBBComposerPreferences.getCharOption('link.target')=='current')
			{
			window.getBrowser().contentDocument.location = url;
			}
		else
			{
			open(url);
			}
		}

	bbcManager.prototype.validateXhtml = function ()
		{
		this.goToURLWithOptions("http://validator.w3.org/check?verbose=1&uri=" + getBrowser().contentDocument.location);
		}

	/*------ Clipboard interactions ------*/
	bbcManager.prototype.copySelectionToClipboard = function ()
		{
		goDoCommand('cmd_copy');
		}
	bbcManager.prototype.getClipboardContentAsText = function ()
		{
		var clip = Components.classes["@mozilla.org/widget/clipboard;1"]
	        	.createInstance(Components.interfaces.nsIClipboard);
		if (!clip) return false;
		var trans = Components.classes["@mozilla.org/widget/transferable;1"]
			.createInstance(Components.interfaces.nsITransferable);
		if (!trans) return false;
		trans.addDataFlavor("text/unicode");
		clip.getData(trans,clip.kGlobalClipboard);
		var str = new Object();
		var strLength = new Object();
		trans.getTransferData("text/unicode",str,strLength);
		if (str) str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
		if (str)
			return str.data.substring(0,strLength.value / 2);
		else
			return "";
		}
	bbcManager.prototype.getClipboardContent = function ()
		{
		var clip = Components.classes["@mozilla.org/widget/clipboard;1"]
	        	.createInstance(Components.interfaces.nsIClipboard);
		if (!clip)
			return null;
		var trans = Components.classes["@mozilla.org/widget/transferable;1"]
			.createInstance(Components.interfaces.nsITransferable);
		if (!trans)
			return null;
		trans.addDataFlavor("application/x-moz-file");
		trans.addDataFlavor("image/jpg");
		trans.addDataFlavor("image/png");
		trans.addDataFlavor("image/jpeg");
		trans.addDataFlavor("image/gif");
		trans.addDataFlavor("text/html");
		trans.addDataFlavor("text/x-moz-url");
		trans.addDataFlavor("text/uri-list");
		trans.addDataFlavor("text/unicode");
		clip.getData(trans,clip.kGlobalClipboard);
		var flavor = new Object();
		var str = new Object();
		var strLength = new Object();
		trans.getAnyTransferData(flavor,str,strLength);
		if(flavor.value=='text/x-moz-url')
			{
			if (str) str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
			if (str)
				return this.focusedBBComposer.importContent(str.data.substring(0,strLength.value / 2),"text/x-moz-url");
			else return null;
			}
		else if(flavor.value=='text/html') //application/x-moz-node
			{
			if (str) str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
			if (str)
				return this.focusedBBComposer.importContent(str.data.substring(0,strLength.value / 2),"text/html");
			else return null;
			}//application/x-moz-node
		else if(flavor.value=='text/unicode'||flavor.value=='text/uri-list')
			{
			if (str) str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
			if (str)
				return this.focusedBBComposer.importContent(str.data.substring(0,strLength.value / 2),"text/unicode");
			else return null;
			}
		else if(flavor.value=='application/x-moz-file')
			{
			alert('text/x-moz-file');
			if (str) str = str.value.QueryInterface(Components.interfaces.nsIFile);
			if (str)
				uri = this._ios.newFileURI(str);
				alert('application/x-moz-file'+uri);
			return this.focusedBBComposer.importFiles(new Array(new File(uri)));
			}
		else if(flavor.value=='image/jpg')
			{
			if (str) str = str.value.QueryInterface(Components.interfaces.nsIInputStream);;
			var myFile = new ewkFile(null);
			if(myFile.fromUserProfile('moz-screenshot.jpg')||myFile.create())
				myFile.writeFromStream(str);
			return this.focusedBBComposer.importFiles(new Array(new File(myFile.file)));
			//return this.focusedBBComposer.importContent(myFile.getUri(),"text/unicode");
			}
		this.displayStatusText('Can\'t paste this content !');
		return null;
		}

	/*------ Statusbar interactions ------*/
	bbcManager.prototype.displayStatusText = function (statustext)
		{
		if(document.getElementById('statusbar-display'))
			document.getElementById('statusbar-display').label = statustext;
		}

	/*------ Dialog interactions ------*/
	bbcManager.prototype.openPopupDialog = function (markup, value)
		{
		var params = {inn:{value:value}, out:null};
		window.openDialog("chrome://bbcomposer/content/popup/" + markup + ".xul", "", "chrome, dialog, modal, resizable=no", params).focus();
		if(params.out&&params.out.value)
			{
			if(params.out.value['src']&&/file:\/\/\/(.+)/.test(params.out.value['src']))
				params.out.value['src']=this.focusedBBComposer.addImportedFile(new File(new ewkFile(params.out.value['src']).file));
			return params.out.value;
			}
		else
			return false;
		}

	/*------ Filesystem interactions ------*/
	bbcManager.prototype.saveToFile = function (content, auto)
		{
		var myFile = new ewkFile(null);
		if(auto)
			{
			if(myFile.fromUserProfile(this.focusedBBComposer.language + '-autosave.bbc')||myFile.create())
				myFile.write(content);
			}
		else if(myFile.fromUserCreation(this.myBBComposerProperties.getString('file_save'), '', this.myBBComposerProperties.getString('file_name') + '.bbc',  '*.bbc;', this.myBBComposerProperties.getString('file_type')))
			myFile.write(content);
		return 1;
		}
	bbcManager.prototype.loadFromFile = function (auto)
		{
		var myFile = new ewkFile(null);
		if(auto)
			{
			if(myFile.fromUserProfile(this.focusedBBComposer.language + '-autosave.bbc'))
				return myFile.read();
			}
		if(myFile.fromUserSelection(this.myBBComposerProperties.getString('file_load'), '', this.myBBComposerProperties.getString('file_name') + '.bbc',  '*.bbc;', this.myBBComposerProperties.getString('file_type')))
			{
			return myFile.read();
			}
		return "";
		}

	/*------ Spellchecker interactions ------*/
	bbcManager.prototype.enableSpellcheck = function ()
		{
		var theEditor=this.focusedBBComposer.editor
			.contentWindow
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIWebNavigation)
			.QueryInterface(Components.interfaces.nsIDocShell)
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIEditingSession)
			.getEditorForWindow(this.focusedBBComposer.editor.contentWindow)
			.QueryInterface(Components.interfaces.nsIEditor);
		theEditor.setSpellcheckUserOverride(true);
		}

	bbcManager.prototype.refreshSpellcheck = function ()
		{
		var theEditor=this.focusedBBComposer.editor
			.contentWindow
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIWebNavigation)
			.QueryInterface(Components.interfaces.nsIDocShell)
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIEditingSession)
			.getEditorForWindow(this.focusedBBComposer.editor.contentWindow)
			.QueryInterface(Components.interfaces.nsIEditor);
		var theInlineSpellChecker = theEditor.getInlineSpellChecker(true);
		theInlineSpellChecker.enableRealTimeSpell=true;
		}

var myBBComposerManager;

function initBBComposer()
	{
	myBBComposerManager =  new bbcManager();
	window.removeEventListener("load", initBBComposer , true);
	}

window.addEventListener("load", initBBComposer, true);
