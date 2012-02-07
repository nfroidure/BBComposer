var bbcBbcodeSupport =
	{
	/* User Interface */
	allowedButtons : new Array('blocks', 'br', 'undo', 'redo', 'align-left', 'align-center', 'align-right', 'i', 'b', 'q', 'u', 'del', 'a', 'img', 'code', 'hr', 'acronym', 'abbr', 'blockquote'),
	allowedBlocks : new Array('p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'dl', 'pre'),
	allowedToolbars : new Array('edition','css'),
	displayedToolbars : new Array('edition','css'),
	allowedSidebars : new Array('degradx', 'gallery', 'smileys', 'cartoon', 'tags', 'canimage'),
	/* Language */
	sourceToEditor : function (string)
		{
		string = bbcUtils.doRegExp(string, /\[([\/]?)b\]/g, '<$1b>');
		string = bbcUtils.doRegExp(string, /\[([\/]?)i\]/g, '<$1i>');
		string = bbcUtils.doRegExp(string, /\[([\/]?)u\]/g, '<$1u>');
		string = bbcUtils.doRegExp(string, /\[([\/]?)s\]/g, '<$1del>');

		string = bbcUtils.doRegExp(string, /\[quote([^\]]+)\]/g, '</p><blockquote cite="$1"><p>');
		string = string.replace('[/quote]', '</p></blockquote><p>', 'g');
		string = string.replace('[quote]', '</p><blockquote><p>', 'g');

		string = bbcUtils.doRegExp(string, /\[([\/]?)code\]/g, '<$1code>');
		string = bbcUtils.doRegExp(string, /\[color=([^\]]*)\]/mg, '<span style="color:$1;">');
		string = string.replace('[/color]', '</span>', 'g');
		string = bbcUtils.doRegExp(string, /\[font=([^\]]*)\]/mg, '<span style="font-family:$1;">');
		string = string.replace('[/font]', '</span>', 'g');
		string = string.replace('[img]', '<img src="', 'g');
		string = string.replace('[/img]', '">', 'g');

		string = string.replace('[left]', '</p><div style="text-align:left;">', 'g');
		string = string.replace('[/left]', '</div><p>', 'g');
		string = string.replace('[center]', '</p><div style="text-align:center;">', 'g');
		string = string.replace('[/center]', '</div><p>', 'g');
		string = string.replace('[right]', '</p><div style="text-align:right;">', 'g');
		string = string.replace('[/right]', '</div><p>', 'g');
		string = string.replace('[indent]', '</p><div style="margin-left:30px;">', 'g');
		string = string.replace('[/indent]', '</div><p>', 'g');

		string = bbcUtils.doRegExp(string, /\[url\]([^\]]*)\[\/url\]/mg, '<a href="$1">$1</a>');
		string = bbcUtils.doRegExp(string, /\[email\]([^\]]*)\[\/email\]/mg, '<a href="mailto:$1">$1</a>');
		string = bbcUtils.doRegExp(string, /\[email=([^\]]*)\]/mg, '<a href="mailto:$1">');
		string = string.replace('[/email]', '</a>');
		string = bbcUtils.doRegExp(string, /\[url=([^\]]*)\]/mg, '<a href="$1">');
		string = string.replace('[/url]', '</a>', 'g');

		string = bbcUtils.doRegExp(string, /(?:\r?\n?)\[size=6\]([^\[]+)\[\/size\](?:\r?\n?)/mg, '</p><h1>$1</h1><p>');
		string = bbcUtils.doRegExp(string, /(?:\r?\n?)\[size=5\]([^\[]+)\[\/size\](?:\r?\n?)/mg, '</p><h2>$1</h2><p>');
		string = bbcUtils.doRegExp(string, /(?:\r?\n?)\[size=4\]([^\[]+)\[\/size\](?:\r?\n?)/mg, '</p><h3>$1</h3><p>');
		string = bbcUtils.doRegExp(string, /(?:\r?\n?)\[size=3\]([^\[]+)\[\/size\](?:\r?\n?)/mg, '</p><h4>$1</h4><p>');
		string = bbcUtils.doRegExp(string, /(?:\r?\n?)\[size=2\]([^\[]+)\[\/size\](?:\r?\n?)/mg, '</p><h5>$1</h5><p>');
		string = bbcUtils.doRegExp(string, /(?:\r?\n?)\[size=1\]([^\[]+)\[\/size\](?:\r?\n?)/mg, '</p><h6>$1</h6><p>');

		string = bbcUtils.doRegExp(string, /\[size=([0-9]+)\]/mg, '<span style="font-size:1.$1em;">');
		string = string.replace('[/size]', '</span>', 'g');
		string = bbcUtils.doRegExp(string, /\[size=([0-9]+)\]/mg, '<span style="font-size:1.$1em;">');
		string = string.replace('[/size]', '</span>', 'g');

		string = bbcUtils.doRegExp(string, /\[\*\]([^\[]+)(\r?\n)/mg, '<li>$1</li>');
		string = bbcUtils.doRegExp(string, /\[\*\]([^\[]+)/mg, '<li>$1</li>');

		string = bbcUtils.doRegExp(string, /\[list=1\]/mg, '</p><ul>');
		string = bbcUtils.doRegExp(string, /\[list\]/mg, '</p><ul>');
		string = bbcUtils.doRegExp(string, /\[\/list\]/mg, '</ul><p>');

		string = bbcUtils.doRegExp(string, /\[([\/]?)([a-z]+)\]/mg, '<!-- BBcode $1$2 -->');
		string = '<p>' + string + '</p>';
		string = bbcUtils.doRegExp(string, /(\r?\n)(\r?\n)(?:[\t\r\n\s]+)/mg, '\r\n\r\n');
		string = bbcUtils.doRegExp(string, /(\r?\n)(\r?\n)/mg, '</p><p>');
		string = bbcUtils.doRegExp(string, /(\r?\n)/mg, '<br>');
		string = bbcUtils.doRegExp(string, />(?:[\r\n]+)</mg, '><');
		string = string.replace('<p><ul>', '<ul>', 'mg');
		string = string.replace('<br><ul>', '</p><ul>', 'mg');
		string = string.replace('<ul><br>', '<ul>', 'mg');
		string = string.replace('</ul></p>', '</ul>', 'mg');
		string = string.replace('</ul><br>', '</ul><p>', 'mg');
		string = string.replace('<p>-----------------------</p>', '<hr>', 'mg');
		string = bbcUtils.doRegExp(string, /<p>([\r\n\t\s]*)<\/p>/mg, '');
		string = bbcUtils.doRegExp(string, /<p><\/p>/mg, '');
		string = string.replace('<p></p>', '', 'mg');
		string = string.replace('<p><br></p>', '', 'mg');
		string = string.replace('<p><br>', '<p>', 'mg');
		string = string.replace('<p><div', '<div', 'mg');
		string = string.replace('</div></p>', '</div>', 'mg');
		return string;
		},
	editorToSource : function (editor)
		{
		var elements = editor.getElementsByTagName('*')
		for(var i=0; i<elements.length; i++)
			{
			if(elements[i].tagName.toLowerCase()=='div')
				{
				if(elements[i].hasAttribute('style'))
					{
					if(/text-align:(?:[ ]*)(left|center|right)(?:[;]?)/.test(elements[i].getAttribute('style')))
						{
						bbcUtils.replaceElementByTextNodes(elements[i], '\r\n\r\n[' + /text-align:(?:[ ]*)(left|center|right)(?:[;]?)/.exec(elements[i].getAttribute('style'))[1] + ']', '[/' + /text-align:(?:[ ]*)(left|center|right)(?:[;]?)/.exec(elements[i].getAttribute('style'))[1] + ']\r\n\r\n');
						i--;
						}	
					else if(/margin-left:(?:[ ]*)30px(?:[;]?)/.test(elements[i].getAttribute('style')))
						{
						bbcUtils.replaceElementByTextNodes(elements[i], '\r\n\r\n[indent]', '[/indent]\r\n\r\n');
						i--;
						}	
					}
				else
					{
					bbcUtils.replaceElementByTextNodes(elements[i], '', '');
					i--;
					}
				}
			else if(elements[i].tagName.toLowerCase()=='span')
				{
				if(elements[i].hasAttribute('class')&&(elements[i].getAttribute('class')=='x'||elements[i].getAttribute('class')=='y'))
					{
					bbcUtils.replaceElementByTextNodes(elements[i],'','');
					i--;
					}
				else if(elements[i].hasAttribute('style'))
					{
					if(/background-color:(?:[ ]*)([^;]+)(?:[;]?)/.test(elements[i].getAttribute('style')))
						{
						bbcUtils.replaceElementByTextNodes(elements[i], '', '');
						i--;
						}
					else if(/color:(?:[ ]*)([^;]+)(?:[;]?)/.test(elements[i].getAttribute('style')))
						{
						bbcUtils.replaceElementByTextNodes(elements[i], '[color=' + rvb2hex(/color:(?:[ ]*)([^;]+)(?:[;]?)/.exec(elements[i].getAttribute('style'))[1]) + ']','[/color]');
						i--;
						}
					else if(/font-size:(?:[ ]*)(?:[1]?)(?:[\.]?)([0-9]+)(?:px|em|pt)(?:[;]?)/.test(elements[i].getAttribute('style')))
						{
						bbcUtils.replaceElementByTextNodes(elements[i], '[size=' + /font-size:(?:[ ]*)(?:[1]?)(?:[\.]?)([0-9]+)(?:px|em|pt)(?:[;]?)/.exec(elements[i].getAttribute('style'))[1] + ']','[/size]');
						i--;
						}
					else if(/font-family:(?:[ ]*)([^;]+)(?:[;]?)/.test(elements[i].getAttribute('style')))
						{
						bbcUtils.replaceElementByTextNodes(elements[i], '[font=' + /font-family:(?:[ ]*)([^;]+)(?:[;]?)/.exec(elements[i].getAttribute('style'))[1] + ']','[/font]');
						i--;
						}
					}
				else
					{
					bbcUtils.replaceElementByTextNodes(elements[i], '', '');
					i--;
					}
				}
			else if(elements[i].tagName.toLowerCase()=='acronym'||elements[i].tagName.toLowerCase()=='abbr')
				{
				if(elements[i].hasAttribute('title'))
					bbcUtils.replaceElementByTextNodes(elements[i],'',' (' + elements[i].getAttribute('title') + ')');
				else
					bbcUtils.replaceElementByTextNodes(elements[i],'','');
				i--;
				}
			else if(elements[i].tagName.toLowerCase()=='a')
				{
				if(elements[i].hasAttribute('href'))
					{
					if(/mailto:(.+)/.test(elements[i].getAttribute('href')))
						bbcUtils.replaceElementByTextNodes(elements[i],'[email=' + elements[i].getAttribute('href').replace(/mailto:(.+)/, '$1') + ']','[/email]');
					else
						bbcUtils.replaceElementByTextNodes(elements[i],'[url=' + elements[i].getAttribute('href') + ']','[/url]');
					}
				else
					bbcUtils.replaceElementByTextNodes(elements[i],'','');
				i--;
				}
			else if(elements[i].tagName.toLowerCase()=='h1')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'\r\n\r\n[size=6]','[/size]\r\n\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='h2')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'\r\n\r\n[size=5]','[/size]\r\n\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='h3')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'\r\n\r\n[size=4]','[/size]\r\n\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='h4')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'\r\n\r\n[size=3]','[/size]\r\n\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='h5')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'\r\n\r\n[size=2]','[/size]\r\n\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='h6')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'\r\n\r\n[size=1]','[/size]\r\n\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='hr')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'\r\n\r\n-----------------------','\r\n\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='b'||elements[i].tagName.toLowerCase()=='strong')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'[b]','[/b]'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='i'||elements[i].tagName.toLowerCase()=='em')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'[i]','[/i]'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='u'||elements[i].tagName.toLowerCase()=='cite')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'[u]','[/u]'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='del')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'[s]','[/s]'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='q')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'"','"'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='code')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'[code]','[/code]'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='blockquote')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'[quote'+(elements[i].hasAttribute('cite')?elements[i].getAttribute('cite'):'')+']','[/quote]'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='dl'||elements[i].tagName.toLowerCase()=='ul'||elements[i].tagName.toLowerCase()=='ol')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'\r\n\r\n[list]\r\n','[/list]\r\n\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='dt')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'[*][b]','[/b]\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='dd')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'[*]','\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='li')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'[*]','\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='p')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'\r\n\r\n','\r\n\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='br')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'\r\n',''); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='img'&&elements[i].hasAttribute('src')&&elements[i].getAttribute('src')!='')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'[img]'+elements[i].getAttribute('src'),'[/img]'); i--;
				}
			else
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'',''); i--;
				}
			}
		var string = editor.innerHTML;
		string = bbcUtils.doRegExp(string, /\[(quote|center|left|right)([^\]]*)\](?:[\t\r\n\s]+)/mg, '[$1$2]');
		string = bbcUtils.doRegExp(string, /(?:[\t\r\n\s]+)\[\/(quote|center|left|right)\]/mg, '[/$1]');
		string = bbcUtils.doRegExp(string, /<!-- BBcode ([\/]?)([^-]+) -->/mg, '[$1$2]');
		string = string.replace('&nbsp;', ' ', 'g');
		string = string.replace('&amp;', '&', 'g');
		string = string.replace('&gt;', '>', 'g');
		string = string.replace('&lt;', '<', 'g');
		string = bbcUtils.doRegExp(string, /(\r?\n)(\r?\n)(\r?\n)/mg, '\r\n\r\n');
		return string.trim();
		},
	inlineMarkups : new Array('a', 'abbr', 'acronym', 'b', 'br', 'code', 'del',
	 'em', 'i', 'img', 'q', 'strong', 'u'),
	blockMarkups : new Array('h1','h2','h3','h4','h5','h6','hr','p','ul','dl','ol','pre'),
	superblockMarkups : new Array('blockquote','div','ins','del')
	};
bbcBbcodeSupport.blockLevelMarkups = [].concat(bbcBbcodeSupport.blockMarkups,bbcBbcodeSupport.superblockMarkups);
bbcBbcodeSupport.acceptedMarkups =
	{
	// Superblock
	"body":
		{"type":"superblock","childs":bbcBbcodeSupport.blockLevelMarkups},
	"blockquote":
		{"type":"superblock","childs":bbcBbcodeSupport.blockLevelMarkups
		//,"attributes":["name":"cite","default":"http://","name":"title","default":""]}
		},
	"div":
		{"type":"superblock","childs":bbcBbcodeSupport.blockLevelMarkups},
	// Block
	"h1":
		{"type":"block","childs":bbcBbcodeSupport.inlineMarkups},
	"h2":
		{"type":"block","childs":bbcBbcodeSupport.inlineMarkups},
	"h3":
		{"type":"block","childs":bbcBbcodeSupport.inlineMarkups},
	"h4":
		{"type":"block","childs":bbcBbcodeSupport.inlineMarkups},
	"h5":
		{"type":"block","childs":bbcBbcodeSupport.inlineMarkups},
	"h6":
		{"type":"block","childs":bbcBbcodeSupport.inlineMarkups},
	"hr":
		{"type":"block","childs":[]},
	"p":
		{"type":"block","childs":bbcBbcodeSupport.inlineMarkups},
	"pre":
		{"type":"block","childs":bbcBbcodeSupport.inlineMarkups},
	"address":
		{"type":"block","childs":bbcBbcodeSupport.inlineMarkups},
	"ul":
		{"type":"block","childs":['li']},
	"ol":
		{"type":"block","childs":['li']},
	"dl":
		{"type":"block","childs":['dt','dd']},
	// Listitems
	"li":
		{"type":"list-item","childs":['ul','ol','dl'].concat(bbcBbcodeSupport.inlineMarkups)},
	"dt":
		{"type":"list-item","childs":['ul','ol','dl'].concat(bbcBbcodeSupport.inlineMarkups)},
	"dd":
		{"type":"list-item","childs":['ul','ol','dl'].concat(bbcBbcodeSupport.inlineMarkups)},
	// Inline
	"u":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups},
	"i":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups},
	"b":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups},
	"em":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups},
	"tt":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups},
	"acronym":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups,"attributes":[{"name":"title","default":"","type":"pleased"}]},
	"abbr":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups,"attributes":[{"name":"title","default":"","type":"pleased"}]},
	"cite":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups},
	"strong":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups},
	"q":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups},
	"br":
		{"type":"inline","childs":[]},
	"a":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups,"attributes":[{"name":"onclick","default":""},{"name":"href","default":"http://","type":"needed"},{"name":"title","default":"","type":"pleased"},{"name":"hreflang","default":""}]},
	"img":
		{"type":"inline","childs":[],"attributes":[{"name":"src","default":"","type":"needed"},{"name":"alt","default":"","type":"pleased"},{"name":"style","default":""}]},
	"sub":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups},
	"sup":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups},
	"var":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups},
	"code":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups},
	"kbd":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups},
	"dfn":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups},
	"span":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups},
	"samp":
		{"type":"inline","childs":bbcBbcodeSupport.inlineMarkups},
	// Mixed
	"ins":
		{"type":"mixed","childs":bbcBbcodeSupport.inlineMarkups},
	"del":
		{"type":"mixed","childs":bbcBbcodeSupport.inlineMarkups},
	// Table
	"table":
		{"type":"block","childs":['caption', 'thead', 'tfoot', 'tbody', 'tr', 'col', 'colgroup']},
	"caption":
		{"type":"table-caption","childs":bbcBbcodeSupport.inlineMarkups},
	"thead":
		{"type":"table-header-group","childs":['tr']},
	"tfoot":
		{"type":"table-footer-group","childs":['tr']},
	"tbody":
		{"type":"table-body-group","childs":['tr']},
	"tr":
		{"type":"table-row","childs":['th', 'td']},
	"td":
		{"type":"table-cell","childs":bbcBbcodeSupport.inlineMarkups},
	"th":
		{"type":"table-cell","childs":bbcBbcodeSupport.inlineMarkups},
	"colgroup":
		{"type":"table-column-group","childs":['col']},
	"col":
		{"type":"table-column","childs":[]}
	};