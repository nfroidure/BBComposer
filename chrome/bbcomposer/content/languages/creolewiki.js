var bbcCreolewikiSupport =
	{
	/* User Interface */
	allowedButtons : new Array('blocks', 'br', 'undo', 'redo', 'em', 'strong', 'q', 'cite', 'del', 'a', 'img', 'hr', 'acronym', 'abbr', 'sub', 'sup', 'table'),
	allowedBlocks : new Array('p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol'),
	allowedToolbars : new Array('edition'),
	displayedToolbars : new Array('edition'),
	allowedSidebars : new Array('gallery', 'tags'),
	/* Language */
	sourceToEditor : function (string)
		{
		// Pas bien
		string = '\r\n' + string + '\r\n';
		// Titres
		string = bbcUtils.doRegExp(string, /======([^=]+)======/mg, '<h6>$1</h6>');
		string = bbcUtils.doRegExp(string, /=====([^=]+)=====/mg, '<h5>$1</h5>');
		string = bbcUtils.doRegExp(string, /====([^=]+)====/mg, '<h4>$1</h4>');
		string = bbcUtils.doRegExp(string, /===([^=]+)===/mg, '<h3>$1</h3>');
		string = bbcUtils.doRegExp(string, /==([^=]+)==/mg, '<h2>$1</h2>');
		string = bbcUtils.doRegExp(string, /=([^=]+)=/mg, '<h1>$1</h1>');
		string = bbcUtils.doRegExp(string, /----([\-]*)/mg, '<hr>');
		/*// Tableaux
		string = string.replace(/{\|([^\|!]*)/mg,'<table $1>');
		string = string.replace(/\|\|}/mg,'</table>');
		while (/<table(.*)>(.*)([\|!]{1,2})([^<]*)<\/table>/m.test(string))
			{
			string = string.replace(/<table>(.*)!!([^\|!]+)([^<]*)<\/table>/,'<table>$1<th>$2</th>$3</table>','gm');
			string = string.replace(/<table>(.*)\|\|([^\|!]+)([^<]*)<\/table>/,'<table>$1<td>$2</td>$3</table>','gm');
			}*/
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
				if(i+1<string.length&&string.charAt(i)=='\n'&&(string.charAt(i+1)=='#'||string.charAt(i+1)=='*'))
					{
					listBegin=i; listLevel=0; listContent='';
					for(i; (i+1<string.length&&(string.charAt(i)!='\n'||string.charAt(i+1)!='\n')); i++)
						{
						if(i<string.length&&string.charAt(i)=='\n'&&(string.charAt(i+1)=='#'||string.charAt(i+1)=='*'))
							{
							itemLevel=0; itemContent='';
							for(var j=i+1; (j<string.length&&(string.charAt(j)=='#'||string.charAt(j)=='*')); j++)
								{	itemLevel++;	}
							for(j; (j<string.length&&(string.charAt(j)!='\n'||((string.charAt(j+1)!='\n')&&string.charAt(j+1)!='#')&&string.charAt(j+1)!='*')); j++)
								itemContent += string.charAt(j);
							if(itemLevel==listLevel)
								{
								listContent += '</li>';
								}
							while(itemLevel>listLevel)
								{
								listLevels[++listLevel] = string.charAt(i+1+itemLevel-1);
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
					string = string.substring(0, listBegin) + listContent + string.substring(i, string.length);
					}
				}
			}
		// Traitement spéciaux (listes, tableaux...)
		string = bbcUtils.doRegExp(string, /(\r?\n)\#/mg, '#');
		string = bbcUtils.doRegExp(string, /(\r?\n)\*/mg, '*');
		string = bbcUtils.doRegExp(string, /(\r?\n)\|/mg, '||');
		string = bbcUtils.doRegExp(string, /(\r?\n)\!/mg, '!!');
		string = '<p>' + string + '</p>';
		string = bbcUtils.doRegExp(string, /(\r?\n)(\r?\n)/mg, '</p><p>');
		string = bbcUtils.doRegExp(string, /(\r?\n)/mg, '<br>');
		// Konshita
		string = bbcUtils.doRegExp(string, /<p><(h[0-9]|hr|ul|ol|table)>/mg, '<$1>');
		string = bbcUtils.doRegExp(string, /<br><(h[0-9]|hr|ul|ol|table)>/mg, '</p><$1>');
		string = bbcUtils.doRegExp(string, /<\/(h[0-9]|hr|ul|ol|table)><\/p>/mg, '</$1>');
		string = bbcUtils.doRegExp(string, /<\/(h[0-9]|hr|ul|ol|table)><br>/mg, '</$1><p>');
		// Mises en forme
		string = bbcUtils.doRegExp(string, /'''''([^']+)'''''/mg, '<strong><em>$1</em></strong>');
		string = bbcUtils.doRegExp(string, /'''([^']+)'''/mg, '<strong>$1</strong>');
		string = bbcUtils.doRegExp(string, /''([^']+)''/mg, '<em>$1</em>');
		string = bbcUtils.doRegExp(string, /\[\[Image:([^\]]+)\]\]/mg, '<img src="$1">');
		string = bbcUtils.doRegExp(string, /\[\[([^\]]+)\]\]/mg,'<span style="font-family: monospace; font-weight: bold;">intlink:($1)</span>');
		string = bbcUtils.doRegExp(string, /{{([^}]+)}}/mg,'<span style="font-family: monospace; font-weight: bold;">intcode($1)</span>');
		string = bbcUtils.doRegExp(string, /\[([^ ]+) ([^\]]+)\]/mg, '<a href="$1">$2</a>');
		string = this.xhtml2html(string);
		return string;
		},
	editorToSource : function (editor)
		{
		var elements = editor.getElementsByTagName('*')
		for(var i=0; i<elements.length; i++)
			{
			if(elements[i].tagName.toLowerCase()=='ul'||elements[i].tagName.toLowerCase()=='ol')
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
		string = string.replace('<br>', '\\\\', 'g');
		string = string.replace('</p>', '\r\n', 'g');
		string = string.replace('<p>', '\r\n', 'g');
		// Mises en forme
		string = bbcUtils.doRegExp(string, /<([\/]?)q>/mg, '"');
		string = bbcUtils.doRegExp(string, /<([\/]?)cite>/mg, '"');
		string = bbcUtils.doRegExp(string, /<em>([^<]+)<\/em>/mg, '//$1//');
		string = bbcUtils.doRegExp(string, /<i>([^<]+)<\/i>/mg, '//$1//');
		string = bbcUtils.doRegExp(string, /<strong>([^<]+)<\/strong>/mg, '**$1**');
		string = bbcUtils.doRegExp(string, /<b>([^<]+)<\/b>/mg, '**$1**');
		string = bbcUtils.doRegExp(string, /<acronym title="([^>]*)">([^>]*)<\/acronym>/, '$2 ($1)');
		string = bbcUtils.doRegExp(string, /<abbr title="([^>]*)">([^>]*)<\/abbr>/mg, '$2 ($1)');
		string = bbcUtils.doRegExp(string, /<img src="([^>]*)">/mg, '{{$1:}}');
		string = bbcUtils.doRegExp(string, /<img alt="(?:[^>]*)" src="([^>]*)">/mg, '{{$2:$1}}');
		string = bbcUtils.doRegExp(string, /<img src="([^>]*)" alt="(?:[^>]*)">/mg, '{{$1:$2}}');
		string = bbcUtils.doRegExp(string, /<span style="font-family: monospace; font-weight: bold;">intlink:\(([^<]+)\)<\/span>/mg,'[[$1]]');
		string = bbcUtils.doRegExp(string, /<span style="font-family: monospace; font-weight: bold;">intcode\(([^<]+)\)<\/span>/mg,'{{$1}}');
		string = bbcUtils.doRegExp(string, /<a href="([^>]*)">([^>]*)<\/a>/mg, '[$1 $2]','gm');
		string = bbcUtils.doRegExp(string, /<a title="(?:[^>]*)" href="([^>]*)">([^>]*)<\/a>/mg, '[[$1 $2]]');
		// Titres
		string = string.replace(/<h([0-6]{1})>(?:[\r\n]+)/mg, '<h$1>');
		string = string.replace(/(?:[\r\n]+)<\/h([0-6]{1})>/mg, '</h$1>');
		string = string.replace('<h1>', '\r\n=', 'g');
		string = string.replace('</h1>', '=\r\n', 'g');
		string = string.replace('<h2>', '\r\n==', 'g');
		string = string.replace('</h2>', '==\r\n', 'g');
		string = string.replace('<h3>', '\r\n===', 'g');
		string = string.replace('</h3>', '===\r\n', 'g');
		string = string.replace('<h4>', '\r\n====', 'g');
		string = string.replace('</h4>', '====\r\n', 'g');
		string = string.replace('<h5>', '\r\n=====', 'g');
		string = string.replace('</h5>', '=====\r\n', 'g');
		string = string.replace('<h6>', '\r\n======', 'g');
		string = string.replace('</h6>', '======\r\n', 'g');
		string = string.replace('<hr>','\r\n----\r\n', 'g');
		// Tableaux
		string = bbcUtils.doRegExp(string, /<([\/]?)t(body|head|foot)>/mg, '');
		//  Konshita
		string = bbcUtils.doRegExp(string, /(\r?\n)(\r?\n)(\r?\n)/mg, '\r\n\r\n');
		string = string.replace(/^\s+|\s+$/g, '')
		string = string.replace('&nbsp;', ' ', 'g');
		string = string.replace('&amp;', '&', 'g');
		string = string.replace('&gt;', '>', 'g');
		string = string.replace('&lt;', '<', 'g');
		return string;
		},
	inlineMarkups : bbcXhtmlSupport.inlineMarkups,
	blockMarkups : bbcXhtmlSupport.blockMarkups,
	superblockMarkups : bbcXhtmlSupport.superblockMarkups,
	acceptedMarkups : bbcXhtmlSupport.acceptedMarkups
	};