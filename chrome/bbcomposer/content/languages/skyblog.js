var bbcSkyblogSupport =
	{
	/* User Interface */
	allowedButtons : new Array('br', 'b', 'i', 'u', 'a', 'hr', 'abbr', 'acronym'),
	allowedBlocks : new Array(),
	allowedToolbars : new Array('edition'),
	displayedToolbars : new Array('edition'),
	allowedSidebars : new Array('degradx'),
	displayedSidebars : new Array('degradx'),
	/* Language */
	sourceToEditor : function (string)
		{
		string = doRegExp(string, /\[([\/]?)g\]/g, '<$1b>');
		string = doRegExp(string, /\[([\/]?)i\]/g, '<$1i>');
		string = doRegExp(string, /\[([\/]?)s\]/g, '<$1u>');
		string = doRegExp(string, /\[c=([^\[]*)\]/mg, '<span style="color:$1;">');
		string = string.replace('[/c]', '</span>', 'g');
		string = doRegExp(string, /\[f=([^\[]*)\]/mg, '<span style="background-color:$1;">');
		string = string.replace('[/f]', '</span>', 'g');
		string = doRegExp(string, /\[x=([^\[]*)\]/g, '<span class="x" title="$1">');
		string = string.replace('[/x]', '</span>', 'g');
		string = doRegExp(string, /\[y=([^\[]*)\]/g, '<span class="y" title="$1">');
		string = string.replace('[/y]', '</span>', 'g');
		string = doRegExp(string, /\[a=([^\[]*)\]/mg, '<a href="$1">');
		string = string.replace('[/a]', '</a>');
		string = doRegExp(string, /(?:[\r\n]*)\[align=(left|center|right)\]/mg, '</p><p style="text-align:$1;">');
		string = doRegExp(string, /\[\/align\](?:[\r\n]*)/mg, '</p><p>');
		string = '<p>' + string + '</p>';
		string = doRegExp(string, /(\r?\n)(\r?\n)/mg, '</p><p>');
		string = doRegExp(string, /(\r?\n)/mg, '<br>');
		string = string.replace('<p>-----------------------</p>', '<hr>', 'g');
		return string;
		},
	editorToSource : function (editor)
		{
		var elements = editor.getElementsByTagName('*')
		for(var i=0; i<elements.length; i++)
			{
			if(elements[i].tagName.toLowerCase()=='span')
				{
				if(elements[i].hasAttribute('class')&&(elements[i].getAttribute('class')=='x'||elements[i].getAttribute('class')=='y'))
					{
					if(elements[i].hasAttribute('title'))
						{
						replaceElementByTextNodes(elements[i], '[' + elements[i].getAttribute('class') + '=' + elements[i].getAttribute('title') + ']','[/' + elements[i].getAttribute('class') + ']');
						i--;
						}
					}
				else if((!elements[i].hasAttribute('title'))&&elements[i].hasAttribute('style'))
					{
					if(/background-color:(?:[ ]*)([^;]+)(?:[;]?)/.test(elements[i].getAttribute('style')))
						{
						replaceElementByTextNodes(elements[i], '[f=' + rvb2hex(/background-color:(?:[ ]*)([^;]+)(?:[;]?)/.exec(elements[i].getAttribute('style'))[1]) + ']','[/f]');
						i--;
						}
					else if(/color:(?:[ ]*)([^;]+)(?:[;]?)/.test(elements[i].getAttribute('style')))
						{
						replaceElementByTextNodes(elements[i], '[c=' + rvb2hex(/color:(?:[ ]*)([^;]+)(?:[;]?)/.exec(elements[i].getAttribute('style'))[1]) + ']','[/c]');
						i--;
						}
					}
				else //if(elements[i].hasAttribute('title')&&elements[i].getAttribute('title')=='t')
					{
					replaceElementByTextNodes(elements[i],'','');
					i--;
					}
				}
			else if(elements[i].tagName.toLowerCase()=='acronym'||elements[i].tagName.toLowerCase()=='abbr')
				{
				if(elements[i].hasAttribute('title'))
					replaceElementByTextNodes(elements[i],'',' (' + elements[i].getAttribute('title') + ')');
				else
					replaceElementByTextNodes(elements[i],'','');
				i--;
				}
			else if(elements[i].tagName.toLowerCase()=='a')
				{
				if(elements[i].hasAttribute('href'))
					replaceElementByTextNodes(elements[i],'[a=' + elements[i].getAttribute('href') + ']','[/a]');
				else
					replaceElementByTextNodes(elements[i],'','');
				i--;
				}
			else if(elements[i].tagName.toLowerCase()=='p'&&elements[i].hasAttribute('style')&&/text-align:(?:[ ]?)(left|center|right)([;]?)/.test(elements[i].getAttribute('style')))
				{
				replaceElementByTextNodes(elements[i],'\r\n\r\n[align=' + elements[i].getAttribute('style').replace(/text-align:([ ]?)(left|center|right)([;]?)/, '$2') + ']','[/align]\r\n\r\n');
				i--;
				}
			else if(elements[i].tagName.toLowerCase()=='strong'||elements[i].tagName.toLowerCase()=='b')
				{
				replaceElementByTextNodes(elements[i],'[g]','[/g]'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='em'||elements[i].tagName.toLowerCase()=='i')
				{
				replaceElementByTextNodes(elements[i],'[i]','[/i]'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='u'||elements[i].tagName.toLowerCase()=='cite')
				{
				replaceElementByTextNodes(elements[i],'[s]','[/s]'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='p')
				{
				replaceElementByTextNodes(elements[i],'\r\n\r\n','\r\n\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='br')
				{
				replaceElementByTextNodes(elements[i],'','\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='hr')
				{
				replaceElementByTextNodes(elements[i],'\r\n\r\n-----------------------','\r\n\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='q')
				{
				replaceElementByTextNodes(elements[i],'"','"'); i--;
				}
			else
				{
				replaceElementByTextNodes(elements[i],'',''); i--;
				}
			}
		var string = editor.innerHTML;
		//string = string.replace('<br></p>', '</p>', 'g');
		//string = string.replace('<hr>', '<p>-----------------------</p>', 'g');
		//string = doRegExp(string, /<\/p>(?:[ \t\r\n]*)<p>/mg, '\r\n\r\n');
		//string = string.replace('<br>', '\r\n', 'g');
		//string = string.replace('</p>', '', 'g');
		//string = string.replace('<p>', '', 'g');
		string = string.replace(/^\s+|\s+$/g, '')
		string = string.replace('&nbsp;', ' ', 'g');
		string = string.replace('&amp;', '&', 'g');
		string = string.replace('&gt;', '>', 'g');
		string = string.replace('&lt;', '<', 'g');
		string = doRegExp(string, /(\r?\n)(\r?\n)(\r?\n)/mg, '\r\n\r\n');
		return string.trim();
		},
	inlineMarkups : new Array('a', 'abbr', 'acronym', 'b', 'br', 'del',	'em', 'i', 'q', 'strong', 'u', 'span'),
	blockMarkups : new Array('p','hr'),
	superblockMarkups : new Array()
	};
bbcSkyblogSupport.acceptedMarkups =
	{
	// Superblock
	"body":
		{"type":"superblock","childs":bbcSkyblogSupport.blockMarkups},
	// Block
	"p":
		{"type":"block","childs":bbcSkyblogSupport.inlineMarkups},
	"hr":
		{"type":"block","childs":[]},
	// Inline
	"u":
		{"type":"inline","childs":bbcSkyblogSupport.inlineMarkups},
	"i":
		{"type":"inline","childs":bbcSkyblogSupport.inlineMarkups},
	"b":
		{"type":"inline","childs":bbcSkyblogSupport.inlineMarkups},
	"em":
		{"type":"inline","childs":bbcSkyblogSupport.inlineMarkups},
	"acronym":
		{"type":"inline","childs":bbcSkyblogSupport.inlineMarkups,"attributes":[{"name":"title","default":""}]},
	"abbr":
		{"type":"inline","childs":bbcSkyblogSupport.inlineMarkups,"attributes":[{"name":"title","default":""}]},
	"cite":
		{"type":"inline","childs":bbcSkyblogSupport.inlineMarkups},
	"strong":
		{"type":"inline","childs":bbcSkyblogSupport.inlineMarkups},
	"q":
		{"type":"inline","childs":bbcSkyblogSupport.inlineMarkups},
	"br":
		{"type":"inline","childs":[]},
	"a":
		{"type":"inline","childs":bbcSkyblogSupport.inlineMarkups,"attributes":[{"name":"onclick","default":""},{"name":"href","default":"http://"},{"name":"title","default":""},{"name":"hreflang","default":""}]},
	"span":
		{"type":"inline","childs":bbcSkyblogSupport.inlineMarkups,"attributes":[{"name":"title","default":""}]},
	};