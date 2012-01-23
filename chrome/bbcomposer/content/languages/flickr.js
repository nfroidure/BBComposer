var bbcFlickrSupport =
	{
	/* User Interface */
	allowedButtons : new Array('br', 'em', 'strong', 'cite', 'a', 'img'),
	allowedBlocks : new Array(),
	allowedToolbars : new Array('edition'),
	displayedToolbars : new Array('edition'),
	allowedSidebars : new Array('gallery', 'smileys', 'cartoon', 'canimage'),
	/* Language */
	sourceToEditor : function (string)
		{
		string = '<p>' + string + '</p>';
		string = bbcUtils.doRegExp(string, /([\r\n]+)(\r?\n)/mg, '</p><p>');
		string = bbcUtils.doRegExp(string, /(\r?\n)(\r?\n)/mg, '</p><p>');
		string = bbcUtils.doRegExp(string, /(\r?\n)/mg, '<br>');
		string = string.replace('<b>', '<strong>', 'g');
		string = string.replace('</b>', '</strong>', 'g');
		string = string.replace('<i>', '<em>', 'g');
		string = string.replace('</i>', '</em>', 'g');
		string = string.replace('<u>', '<cite>', 'g');
		string = string.replace('</u>', '</cite>', 'g');
		return string;
		},
	editorToSource : function (editor)
		{
		var elements = editor.getElementsByTagName('*')
		for(var i=0; i<elements.length; i++)
			{
			if(elements[i].tagName.toLowerCase()=='img')
				{
				for(var j=0; j<elements[i].attributes.length; j++)
					{
					if(elements[i].attributes[j]['name']=='style')
						{
						if(/(?:.*)width:(?:[ ]?)([0-9]+)(?:[ ]?)px(?:.*)/.test(elements[i].attributes[j]['value']))
							{ elements[i].setAttribute('width', elements[i].attributes[j]['value'].replace(/(?:.*)width:(?:[ ]?)([0-9]+)(?:[ ]?)px(?:.*)/,'$1')); }
						if(/(?:.*)height:(?:[ ]?)([0-9]+)(?:[ ]?)px(?:.*)/.test(elements[i].attributes[j]['value']))
							{ elements[i].setAttribute('height', elements[i].attributes[j]['value'].replace(/(?:.*)height:(?:[ ]?)([0-9]+)(?:[ ]?)px(?:.*)/,'$1')); }
						}
					if(elements[i].attributes[j]['name']!='alt'&&elements[i].attributes[j]['name']!='src'&&elements[i].attributes[j]['name']!='title')
						{ elements[i].removeAttribute(elements[i].attributes[j]['name']); j--; }
					}
				}
			else if(elements[i].tagName.toLowerCase()=='a')
				{
				for(var j=0; j<elements[i].attributes.length; j++)
					{
					if(elements[i].attributes[j]['name']!='onclick')
						elements[i].setAttribute('target', '_blank');
					if(elements[i].attributes[j]['name']!='href'&&elements[i].attributes[j]['name']!='target')
						{ elements[i].removeAttribute(elements[i].attributes[j]['name']); j--; }
					}
				}
			else if(elements[i].tagName.toLowerCase()=='p')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'\r\n', '\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='br')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'\r\n', ''); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='strong'||elements[i].tagName.toLowerCase()=='b')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'<strong>', '</strong>'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='em'||elements[i].tagName.toLowerCase()=='i')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'<em>', '</em>'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='cite'||elements[i].tagName.toLowerCase()=='u')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'<u>', '</u>'); i--;
				}
			else
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'', ''); i--;
				}
			}
		var string = editor.innerHTML;
		string = string.replace(/(?:[\r\n]+)([]+)(?:[\r\n]+)/m, '$1')
		string = bbcUtils.doRegExp(string, /(\r?\n)(\r?\n)(\r?\n)/mg, '\r\n\r\n');
		return string;
		},
	inlineMarkups : new Array('br', 'b', 'i', 'u', 'em', 'strong', 'cite', 'a', 'img'),
	blockMarkups : new Array('p'),
	superblockMarkups : new Array()
	};
bbcFlickrSupport.acceptedMarkups =
	{
	// Superblock
	"body":
		{"type":"superblock","childs":bbcXhtmlnbSupport.blockMarkups},
	// Block
	"p":
		{"type":"block","childs":bbcXhtmlnbSupport.inlineMarkups},
	// Inline
	"u":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"i":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"b":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"em":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"strong":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"cite":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"br":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"a":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups,"attributes":[{"name":"onclick","default":""},{"name":"href","default":"http://"},{"name":"title","default":""},{"name":"hreflang","default":""}]},
	"img":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups,"attributes":[{"name":"src","default":""},{"name":"alt","default":""},{"name":"style","default":""}]},
	};