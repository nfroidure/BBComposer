var bbcXulfrSupport =
	{
	/* User Interface */
	allowedButtons : new Array('blocks', 'br', 'em', 'strong', 'q', 'cite', 'a', 'img', 'hr', 'acronym'),
	allowedBlocks : new Array('p','ul','ol','h1','h2','h3','pre'),
	allowedToolbars : new Array('edition'),
	displayedToolbars : new Array('edition'),
	allowedSidebars : new Array('kgen'),
	/* Language */
	sourceToEditor : function (string)
		{
		// Code
		while(string.search(/(\n\s)/mg)>0)
			{
			var replace = '</p><p><code>';
			for(var i=string.search(/(\n\s)/mg)+2; i<string.length&&(string.charAt(i)!='\n'||string.charAt(i+1)==' '); i++)
				{
				if(string.charAt(i)=='\n'&&string.charAt(i+1)==' ')
					{ replace+='<br/>'; i++ }
				else if(string.charAt(i)!='\r')
					replace+='&#' + string.charCodeAt(i) + ';';
				}
			replace += '</code></p><p>';
			string = string.substring(0, string.search(/(\r?\n\s)/mg)) + replace + i, string.length);
			}
		while(string.search(/@@/mg)>0)
			{
			var replace = '<code>';
			for(var i=string.search(/@@/mg)+2; i<string.length&&string.charAt(i)!='\n'&&(string.charAt(i)!='@'||string.charAt(i+1)!='@'); i++)
				{
				replace+='&#' + string.charCodeAt(i) + ';';
				}
			replace += '</code>';
			string = string.substring(0, string.search(/@@/mg)) + replace + i, string.length);
			}
		// Bloc de citation
		while(string.search(/(\n>+)/mg)>0)
			{
			var replace = '</p><p><blockquote>';
			for(var i=string.search(/(\n>+)/mg)+2; i<string.length&&(string.charAt(i)!='\n'||string.charAt(i+1)=='>'); i++)
				{
				if((string.charAt(i)=='\n')
					{
					while(string.charAt(i+1)=='>')
						i++;
					replace += ' ';
					}
				replace+='&#' + string.charCodeAt(i) + ';';
				}
			replace += '</blockquote></p><p>';
			}
		// Listes
		if(/(?:[\r\n]{1})([\s\t]?)(\#|\*)/.test(string))
			{
			var itemLevel;
			var itemContent;
			var listLevels = new Array();
			var listLevel=0;
			var listContent;
			var listBegin;
			for(var i=0; i<string.length; i++)
				{
				if(i+2<string.length&&string.charAt(i)!='|'&&string.charAt(i)=='\n'&&(string.charAt(i+1)=='#'||string.charAt(i+1)=='*'||string.charAt(i+1)=='-'))
					{
					listBegin=i; listLevel=0; listContent='';
					for(i; (i<string.length-1&&string.charAt(i)!='|'&&(string.charAt(i)!='\n'||string.charAt(i+1)!='\n')); i++)
						{
						if(i<string.length-2&&string.charAt(i)=='\n'&&(string.charAt(i+1)=='#'||string.charAt(i+1)=='*')||string.charAt(i+1)=='-'))
							{
							itemLevel=0; itemContent='';
							for(var j=i+2; (j<string.length&&(string.charAt(j)=='#'||string.charAt(j)=='*')||string.charAt(j)=='-')); j++)
								{	itemLevel++;	}
							for(j; (j<string.length-2&&string.charAt(j)!='|'&&(string.charAt(j)!='\n'||((string.charAt(j+1)!='\n')&&(string.charAt(j+1)!='-'&&string.charAt(j+1)!='#')&&string.charAt(j+1)!='*'))); j++)
								itemContent += string.charAt(j);
							if(itemLevel==listLevel)
								{
								listContent += '</li>';
								}
							while(itemLevel>listLevel)
								{
								listLevels[++listLevel] = string.charAt(i+2+itemLevel-1);
								if(listLevels[listLevel]=='#')
									listContent += '<ol>';
								else
									listContent += '<ul>';
								}
							while(itemLevel<listLevel)
								{
								listContent += '</li>';
								if(listLevels[listLevel--]=='#')
									listContent += '</ol>';
								else
									listContent += '</ul>';
								listContent += '</li>';
								}
							listContent += '<li>' + itemContent;
							}
						}
					while(listLevel>0)
						{
						if(listLevels[listLevel--]=='#')
							listContent += '</li></ol>';
						else
							listContent += '</li></ul>';
						}
					string = string.substring(0, listBegin) + '\n' + listContent + string.substring(i, string.length);
					}
				}
			}
		// Blocs
		string = bbcUtils.doRegExp(string, /(\r?\n)!([^\r\n]+)/mg, '<h2>$1</h2>');
		string = bbcUtils.doRegExp(string, /(\r?\n)!!([^\r\n]+)/mg, '<h3>$1</h3>');
		string = bbcUtils.doRegExp(string, /(\r?\n)!!!([^\r\n]+)/mg, '<h4>$1</h4>');
		string = bbcUtils.doRegExp(string, /----/mg, '<hr />');
		// Mises en forme
		string = bbcUtils.doRegExp(string, /\[([^\]\|]+)\]/mg, '<a href="$1">$1</a>');
		string = bbcUtils.doRegExp(string, /\[([^\]\|]+)\|([^\]\|]+)(?:[\|]?)([^\]\|]*)(?:[\|]?)([^\]\|]*)\]/g, '<a title="$4" href="$2" hreflang="$3"/>$1</a>');
		string = bbcUtils.doRegExp(string, /\(\(([^\]\|]+)(?:[\|]?)([^\]\|]*)(?:[\|]?)([^\]\|]*)(?:[\|]?)([^\]\|]*)\)\)/mg, '<img src="$1" alt="$2" style="float:$3;" longdesc="$4" />');
		string = bbcUtils.doRegExp(string, /\^\^([^\^\|]+)(?:[\|]?)([^\^\|]*)(?:[\|]?)([^\^\|]*)\]/mg, '<q cite="$3" lang="$2">$1</a>');	
		string = bbcUtils.doRegExp(string, /__([^_]+)__/mg, '<strong>$1</strong>');
		string = bbcUtils.doRegExp(string, /''([^']+)''/mg, '<em>$1</em>');
		string = bbcUtils.doRegExp(string, /\{\{([^\}]+)\}\}/mg, '<cite>$1</cite>');
		string = bbcUtils.doRegExp(string, /\?\?([^\|]+)|([^\?]+)\?\?/mg, '<acronym title="$2">$1</a>');
		string = string.replace('%%%','<br/>', 'g');
		return string;
		},
	editorToSource : function (editor)
		{
		var elements = editor.getElementsByTagName('*')
		for(var i=0; i<elements.length; i++)
			{
			if(elements[i].tagName.toLowerCase()=='code')
				{
				var brs = elements[i].getElementsByTagName('br');
				if(brs.length>0)
					{
					bbcUtils.replaceElementByTextNodes(brs[0],'\r\n ', '');
					bbcUtils.replaceElementByTextNodes(elements[i],'\r\n ', '\r\n');
					}
				
				}
			else if(elements[i].tagName.toLowerCase()=='ul'||elements[i].tagName.toLowerCase()=='ol')
				{
				var items = elements[i].getElementsByTagName('li');
				while(items.length>0)
					{
					var temp='';
					var curParent = items[0];
					while(curParent.parentNode)
						{
						curParent = curParent.parentNode;
						if(curParent.nodeName.toLowerCase()=='ol')
							temp = '#' + temp;
						else if(curParent.nodeName.toLowerCase()=='ul')
							temp = '*' + temp;
						}
					bbcUtils.replaceElementByTextNodes(items[0],'\r\n'  + temp, '');
					}
				var lists = elements[i].getElementsByTagName('ul');
				while(lists.length>0)
					{
					bbcUtils.replaceElementByTextNodes(lists[0],'','');
					}
				bbcUtils.replaceElementByTextNodes(elements[i],'', '');
				i--;
				}
			}
		var string = editor.innerHTML;
		// Mise en page
		string = string.replace('</p><p>', '\r\n\r\n', 'g');
		string = string.replace('<br>', '%%%', 'g');
		string = string.replace('</p>', '\r\n', 'g');
		string = string.replace('<p>', '\r\n', 'g');
		// Mises en forme
		string = bbcUtils.doRegExp(string, /<([\/]?)code>/mg, '@@');
		string = bbcUtils.doRegExp(string, /<cite>([^<]+)<\/cite>/mg, '{{$1}}')
		string = bbcUtils.doRegExp(string, /<em>([^<]+)<\/em>/mg, '\'\'$1\'\'');
		string = bbcUtils.doRegExp(string, /<strong>([^<]+)<\/strong>/mg, '__$1__');
		string = bbcUtils.doRegExp(string, /<acronym title="([^>]*)">([^>]*)<\/acronym>/, '??$2|$1??');
		// Titres
		string = string.replace('<h1>', '\r\n!', 'g');
		string = string.replace('<h2>', '\r\n!!', 'g');
		string = string.replace('<h3>', '\r\n!!!', 'g');
		string = string.replace(/<\/h([0-6]{1})>/mg, '\r\n');
		string = string.replace('<hr>','\r\n----\r\n', 'g');
		//  Konshita
		string = bbcUtils.doRegExp(string, /(\r?\n)(\r?\n)(\r?\n)/mg, '\r\n\r\n');
		return string;
		},
	inlineMarkups : bbcXhtmlSupport.inlineMarkups,
	blockMarkups : bbcXhtmlSupport.blockMarkups,
	superblockMarkups : bbcXhtmlSupport.superblockMarkups,
	acceptedMarkups : bbcXhtmlSupport.acceptedMarkups
	};
