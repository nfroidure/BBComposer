var bbcSpipSupport =
	{
	/* User Interface */
	allowedButtons : new Array('blocks', 'br', 'em', 'strong', 'a', 'img', 'table', 'anchor', 'sub', 'sup', 'code', 'hr', 'abbr', 'blockquote', 'poetry'),
	allowedBlocks : new Array('p', 'h2', 'ul', 'ol'),
	allowedToolbars : new Array('edition'),
	displayedToolbars : new Array('edition'),
	allowedSidebars : new Array('tags'),
	/* Language */
	sourceToEditor : function (string)
		{
		// Manip peu élégante
		string = '\r\n' + string + '\r\n';
		// Code
		string = string.replace('<code>', '<temp>','g');
		string = string.replace('</code>', '</temp>','g');
		while(string.search(/<temp>/mg)>0)
			{
			var replace = '<code class="spip-code">';
			for(var i=string.search(/<temp>/mg)+6; i<string.search(/<\/temp>/mg); i++)
				{
				if(string.charAt(i)=='\n')
					replace+='<br>';
				else if(string.charAt(i)!='\r')
					replace+='&#' + string.charCodeAt(i) + ';';
				}
			replace += '</code>';
			if(string.search(/<\/temp>/mg)<1)
				string = string.substring(0, string.search(/<temp>/mg)) + replace + string.substring(string.search(/<temp>/mg)+6, string.length);
			else
				string = string.substring(0, string.search(/<temp>/mg)) + replace + string.substring(string.search(/<\/temp>/mg)+7, string.length);
			}
		// Cadre
		while(string.search(/<cadre>/mg)>0)
			{
			var replace = '<div class="spip-cadre">';
			for(var i=string.search(/<cadre>/mg)+7; i<string.search(/<\/cadre>/mg); i++)
				{
				if(string.charAt(i)=='\n')
					replace+='<br>';
				else if(string.charAt(i)!='\r')
					replace+=string.charAt(i);
				}
			replace += '</div>';
			if(string.search(/<\/cadre>/mg)<1)
				string = string.substring(0, string.search(/<cadre>/mg)) + replace + string.substring(string.search(/<cadre>/mg)+7, string.length);
			else
				string = string.substring(0, string.search(/<cadre>/mg)) + replace + string.substring(string.search(/<\/cadre>/mg)+8, string.length);
			}
		// Poesie
		while(string.search(/<poesie>/mg)>0)
			{
			var replace = '<div class="spip-poesie">';
			for(var i=string.search(/<poesie>/mg)+8; i<string.search(/<\/poesie>/mg); i++)
				{
				if(string.charAt(i)=='\n')
					replace+='<br>';
				else if(string.charAt(i)!='\r')
					replace+=string.charAt(i);
				}
			replace += '</div>';
			if(string.search(/<\/poesie>/mg)<1)
				string = string.substring(0, string.search(/<poesie>/mg)) + replace + string.substring(string.search(/<poesie>/mg)+8, string.length);
			else
				string = string.substring(0, string.search(/<poesie>/mg)) + replace + string.substring(string.search(/<\/poesie>/mg)+9, string.length);
			}
		// Documents
		string = bbcUtils.doRegExp(string, /<img([0-9]+)\|(left|center|right)>/mg, '<span class="spip-document-$2"><img src="chrome://spip/skin/spip-image.png" alt="$1"/></span>');
		string = bbcUtils.doRegExp(string, /<img([0-9]+)>/mg, '<span class="spip-document-left"><img src="chrome://spip/skin/spip-image.png" alt="$1"/></span>');
		string = bbcUtils.doRegExp(string, /<((?:[a-z]+)(?:[0-9]+))\|(left|center|right)>/mg, '<span class="spip-document-$2"><img src="chrome://spip/skin/spip-document.png" alt="$1"/></span>');
		string = bbcUtils.doRegExp(string, /<((?:[a-z]+)(?:[0-9]+))>/mg, '<span class="spip-document-left"><img src="chrome://spip/skin/spip-document.png" alt="$1"/></span>');
		// Blocs
		string = string.replace('{{{', '<h2>','g');
		string = string.replace('}}}', '</h2>','g');
		string = string.replace('{2{', '<h3>','g');
		string = string.replace('}2}', '</h3>','g');
		string = string.replace('{3{', '<h4>','g');
		string = string.replace('}3}', '</h4>','g');
		string = string.replace('{4{', '<h5>','g');
		string = string.replace('}4}', '</h5>','g');
		string = string.replace('{5{', '<h6>','g');
		string = string.replace('}5}', '</h6>','g');
		string = string.replace('<quote>', '<blockquote>','g');
		string = string.replace('</quote>', '</blockquote>','g');
		string = string.replace('----','<hr>','g');
		// En ligne
		string = bbcUtils.doRegExp(string, /\[\[([^\]\[]+)\]\]/g, '<span class="spip-note" title="$1"></span>');
		string = bbcUtils.doRegExp(string, /\[([^<\-\]]+)<\-\]/g, '<span id="$1"/></span>');
		string = bbcUtils.doRegExp(string, /\[\?([^\]\|\?]+)\|([^\?\]\|]+)\]/g, '<span class="spip-wikipedia" title="$2">$1</span>');
		string = bbcUtils.doRegExp(string, /\[\?([^\]\|\?]+)\]/g, '<span class="spip-wikipedia">$1</span>');
		string = bbcUtils.doRegExp(string, /\[([^\|\]\{]+)(?:[\|]?)([^\|\{\-\]]*)(?:[\{]{0,2})([^\{\}\]\->]*)(?:[\}]{0,2})->([^\]]+)\]/g, '<a title="$2" href="$4" hreflang="$3"/>$1</a>');
		string = bbcUtils.doRegExp(string, /\[([^\|\]\?]+)\|([^\]\?\|]+)\]/g, '<abbr title="$2">$1</abbr>');
		string = bbcUtils.doRegExp(string, /\[([^<]+)<-\]/g, '<span id="$1"></span>');
		string = string.replace('[*', '<strong class="caractencadre-spip">','g');
		string = string.replace('*]', '</strong>','g');
		string = string.replace('<sc>', '<span style="font-variant: small-caps;">','g');
		string = string.replace('</sc>', '</span>','g');
		// Autres
		string = string.replace('[|', '<div style="text-align:center;">','g');
		string = string.replace('|]', '</div>','g');
		string = string.replace('[/', '<div style="text-align:right;">','g');
		string = string.replace('/]', '</div>','g');
		string = string.replace('[(', '<div class="texteencadre-spip">','g');
		string = string.replace(')]', '</div>','g');
		// Listes
		if(/(?:[\r\n]{1})([\s\t]?)-(\#|\*)/.test(string))
			{
			var itemLevel;
			var itemContent;
			var listLevels = new Array();
			var listLevel=0;
			var listContent;
			var listBegin;
			for(var i=0; i<string.length; i++)
				{
				if(i+2<string.length&&string.charAt(i)!='|'&&string.charAt(i)=='\n'&&string.charAt(i+1)=='-'&&(string.charAt(i+2)=='#'||string.charAt(i+2)=='*'))
					{
					listBegin=i; listLevel=0; listContent='';
					for(i; (i<string.length-1&&string.charAt(i)!='|'&&(string.charAt(i)!='\n'||string.charAt(i+1)!='\n')&&string.charAt(i)!='|'); i++)
						{
						if(i<string.length-2&&string.charAt(i)!='|'&&string.charAt(i)=='\n'&&string.charAt(i+1)=='-'&&(string.charAt(i+2)=='#'||string.charAt(i+2)=='*'))
							{
							itemLevel=0; itemContent='';
							for(var j=i+2; (j<string.length&&string.charAt(j)!='|'&&(string.charAt(j)=='#'||string.charAt(j)=='*')); j++)
								{	itemLevel++;	}
							for(j; (j<string.length-2&&string.charAt(j)!='|'&&(string.charAt(j)!='\n'||((string.charAt(j+1)!='\n')&&(string.charAt(j+1)!='-'&&string.charAt(j+2)!='#')&&string.charAt(j+2)!='*'))); j++)
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
		// Tableaux
		if(/(?:[\r\n]{1})([\s\t]?)||/.test(string))
			{
			var rowContent;
			var cellContent;
			var listLevels = new Array();
			var listLevel=0;
			var tableContent;
			var tableBegin;
			for(var i=0; i<string.length; i++)
				{
				if(string.charAt(i)=='|'&&string.charAt(i+1)=='|')
					{
					cellContent=''; tableBegin=i;
					for(i=i+2; (i<string.length&&string.charAt(i)!='|'); i++)
						if(string.charAt(i)!=' '||string.charAt(i+1)!=' ')
							cellContent+=string.charAt(i);
					cellContent='<caption>' + cellContent.trim() + '</caption>';
					tableContent='</p><table';
					if(i+1<string.length)
						{
						if(string.charAt(i+1)!='|')
							{
							tableContent+=' summary="';
							for(i=i+1; i<string.length&&string.charAt(i)!='|'; i++)
								if(string.charAt(i)!=' '||string.charAt(i+1)!=' ')
									tableContent+=string.charAt(i);
							tableContent+='"';
							}
						}
					tableContent+='>'+cellContent+'<tbody>'; cellContent='';
					for(i=i+2; i<string.length&&(string.charAt(i-1)!='|'||string.charAt(i)!='\n'||string.charAt(i+1)!='\n'); i++)
						{
						if(i<string.length&&(string.charAt(i)!='\n'||string.charAt(i+1)!='|'))
							{
							rowContent='<tr>';
							for(i; i<string.length&&(string.charAt(i)!='|'||string.charAt(i+1)!='\n'||string.charAt(i+2)!='|')&&(string.charAt(i)!='|'||string.charAt(i+1)!='\n'||string.charAt(i+2)!='\n'); i++)
								{
								if(string.charAt(i)=='|'&&string.charAt(i+1)!='\n'&&((string.charAt(i+2)=='{'&&string.charAt(i+3)=='{')||(string.charAt(i+3)=='{'&&string.charAt(i+4)=='{')))
									{
									var colContent = '';
									for(i=i+1; i<string.length&&(string.charAt(i)!='|'); i++)
										if(string.charAt(i)!='{'&&string.charAt(i)!='}'&&(string.charAt(i)!=' '||string.charAt(i+1)!=' '))
											colContent+=string.charAt(i);
									rowContent +='<th>'+ colContent.trim() + '</th>'; i--;
									}
								else if(string.charAt(i)=='|'&&string.charAt(i+1)!='\n')
									{
									colContent = '';
									for(i=i+1; i<string.length&&(string.charAt(i)!='|'); i++)
										if(string.charAt(i)!=' '||string.charAt(i+1)!=' ')
											colContent+=string.charAt(i);
									rowContent +='<td>'+ colContent.trim() + '</td>'; i--;
									}
								}
							tableContent += rowContent + '</tr>';
							}
						}
					tableContent+='</tbody></table>\n';
					string = string.substring(0, tableBegin) + tableContent + string.substring(i, string.length);
					}
				}
			}
		// En ligne conflictueux avec tableaux
		string = string.replace('{{', '<strong>','g');
		string = string.replace('}}', '</strong>','g');
		string = string.replace('{', '<em>','g');
		string = string.replace('}', '</em>','g');
		// Caractere speciaux
		string = string.replace('<-->', '&#8596;','g');
		string = string.replace('-->', '&#8594;','g');
		string = string.replace('<--', '&#8592;','g');
		string = string.replace('--', '&#82124;','g');
		string = string.replace('~', '&nbsp;','g');
		// Conversion retours chariots
		string = '<p>' + string + '</p>';
		string = bbcUtils.doRegExp(string, /([\r\n]+)(\r?\n)/mg, '</p><p>');
		string = bbcUtils.doRegExp(string, /(\r?\n)_/mg, '<br>');
		// Konshita (Serviche de nettoyache des retours chariots en trop)
		string = string.replace('<p></p>', '', 'g');
		string = bbcUtils.doRegExp(string, /<p><(h[0-9]|hr|ul|ol|table)>/mg, '<$1>');
		string = bbcUtils.doRegExp(string, /<br><(h[0-9]|hr|ul|ol|table)>/mg, '</p><$1>');
		string = bbcUtils.doRegExp(string, /<\/(h[0-9]|hr|ul|ol|table)><\/p>/mg, '</$1>');
		string = bbcUtils.doRegExp(string, /<\/(h[0-9]|hr|ul|ol|table)><br>/mg, '</$1><p>');
		string = bbcUtils.doRegExp(string, /<\/(div|blockquote)>(?:[\r\n\t\s]*)<\/p>/mg, '</p></$1>');
		string = bbcUtils.doRegExp(string, /<p>(?:[\r\n\t\s]*)<(div|blockquote)([^>]*)>/mg, '<$1$2><p>');
		return string;
		},
	editorToSource : function (editor)
		{
		var elements = editor.getElementsByTagName('*')
		for(var i=0; i<elements.length; i++)
			{
			if(elements[i].hasAttribute('id'))
				{
				if(elements[i].tagName.toLowerCase()=='span')
					{
					bbcUtils.replaceElementByTextNodes(elements[i], '[', elements[i].getAttribute('id') + '<--]');
					i--;
					}
				else
					{
					var newElement = element.ownerDocument.createTextNode('[' + elements[i].getAttribute('id') + '<--]');
					elements[i].insertBefore(newElement, elements[i].firstChild);
					elements[i].removeAttribute('id');
					}
				}
			if(elements[i].lastChild&&elements[i].lastChild.nodeName.toLowerCase()=='br')
				{
				elements[i].removeChild(elements[i].lastChild);
				}
			if(elements[i].tagName.toLowerCase()=='div')
				{
				if(elements[i].hasAttribute('style'))
					{
					if(/(?:.*)text-align:(?:[ ]?)right(?:[;]?)(?:.*)/.test(elements[i].getAttribute('style')))
						{
						bbcUtils.replaceElementByTextNodes(elements[i],'\r\n\r\n[/','/]\r\n\r\n');
						i--;
						}
					else if(/(?:.*)text-align:(?:[ ]?)center(?:[;]?)(?:.*)/.test(elements[i].getAttribute('style')))
						{
						bbcUtils.replaceElementByTextNodes(elements[i],'\r\n\r\n[|','|]\r\n\r\n');
						i--;
						}
					}
				else if(elements[i].hasAttribute('class'))
					{
					if(elements[i].getAttribute('class')=='spip-cadre')
						{
						var brs = elements[i].getElementsByTagName('br');
						while(brs[0])
							bbcUtils.replaceElementByTextNodes(brs[0], '\r\n', '');
						bbcUtils.replaceElementByTextNodes(elements[i],'\r\n\r\n<-cadre->','<-/cadre->\r\n\r\n');
						i--;
						}
					else if(elements[i].getAttribute('class')=='texteencadre-spip')
						{
						bbcUtils.replaceElementByTextNodes(elements[i],'\r\n\r\n[(',')]\r\n\r\n');
						i--;
						}
					else if(elements[i].getAttribute('class')=='spip-poesie')
						{
						var brs = elements[i].getElementsByTagName('br');
						while(brs[0])
							bbcUtils.replaceElementByTextNodes(brs[0], '\r\n', '');
						bbcUtils.replaceElementByTextNodes(elements[i],'\r\n\r\n<-poesie->','<-/poesie->\r\n\r\n');
						i--;
						}
					}
				}
			else if(elements[i].tagName.toLowerCase()=='span')
				{
				if(elements[i].hasAttribute('class'))
					{
					if(elements[i].getAttribute('class')=='spip-wikipedia')
						{
						bbcUtils.replaceElementByTextNodes(elements[i],'[?',']');
						i--;
						}
					else if(elements[i].getAttribute('class')=='spip-note')
						{
						bbcUtils.replaceElementByTextNodes(elements[i],'[[' + elements[i].getAttribute('title') + ']]','');
						i--;
						}
					else if(/spip-document-(left|center|right)/.test(elements[i].getAttribute('class')))
						{
						if(elements[i].firstChild.nodeName.toLowerCase()=='img'&&elements[i].firstChild.hasAttribute('alt')&&/^([0-9]+)$/.test(elements[i].firstChild.getAttribute('alt')))
							{
							var temp = elements[i].firstChild.getAttribute('alt');
							elements[i].removeChild(elements[i].firstChild);
							bbcUtils.replaceElementByTextNodes(elements[i],'<-img' + temp + '|' + elements[i].getAttribute('class').replace(/spip-document-(left|center|right)/, '$1') + '->','');
							i=i-2;
							}
						else if(elements[i].firstChild.nodeName.toLowerCase()=='img'&&elements[i].firstChild.hasAttribute('alt'))
							{
							var temp = elements[i].firstChild.getAttribute('alt');
							elements[i].removeChild(elements[i].firstChild);
							bbcUtils.replaceElementByTextNodes(elements[i],'<-' + temp + (elements[i].getAttribute('class').replace(/spip-document-(left|center|right)/, '$1')!='left' ? '|' + elements[i].getAttribute('class').replace(/spip-document-(left|center|right)/, '$1') : '') + '->','');
							i=i-2;
							}
						}
					}
				else if(elements[i].hasAttribute('style'))
					{
					if(/(?:.*)font-variant:(?:[ ]?)small-caps(?:[;]?)(?:.*)/.test(elements[i].getAttribute('style')))
						{
						bbcUtils.replaceElementByTextNodes(elements[i],'<-sc->','<-/sc->');
						i--;
						}
					}
				}
			else if(elements[i].tagName.toLowerCase()=='strong'&&elements[i].hasAttribute('class')&&elements[i].getAttribute('class')=='caractencadre-spip')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'[*','*]');
				i--;
				}
			else if(elements[i].tagName.toLowerCase()=='a'&&elements[i].hasAttribute('href'))
				{
				if((elements[i].hasAttribute('title')&&elements[i].getAttribute('title')!='')||(elements[i].hasAttribute('hreflang')&&elements[i].getAttribute('hreflang')!=''))
					{
					if(elements[i].hasAttribute('hreflang')&&elements[i].getAttribute('hreflang')!='')
						{
						bbcUtils.replaceElementByTextNodes(elements[i],'[', '|' + (elements[i].hasAttribute('title') ? elements[i].getAttribute('title') : '') + '{{' + elements[i].getAttribute('hreflang') + '}}-->' + elements[i].getAttribute('href') +']');
						}
					else
						bbcUtils.replaceElementByTextNodes(elements[i],'[','|' + elements[i].getAttribute('title') + '-->' + elements[i].getAttribute('href') + ']');
					}
				else
					bbcUtils.replaceElementByTextNodes(elements[i],'[','-->' + elements[i].getAttribute('href') + ']');
				i--;
				}
			else if(elements[i].tagName.toLowerCase()=='code')
				{
				var brs = elements[i].getElementsByTagName('br');
				while(brs[0])
				bbcUtils.replaceElementByTextNodes(brs[0], '\r\n', '');
				bbcUtils.replaceElementByTextNodes(elements[i],'<-code->','<-/code->');
				i--;
				}
			else if(elements[i].tagName.toLowerCase()=='abbr')
				{
				bbcUtils.replaceElementByTextNodes(elements[i],'[', '|' + elements[i].getAttribute('title') + ']');
				i--;
				}
			else if(elements[i].tagName.toLowerCase()=='ul'||elements[i].tagName.toLowerCase()=='ol')
				{
				var items = elements[i].getElementsByTagName('li');
				while(items.length>0)
					{
					if(items[0].lastChild&&items[0].lastChild.nodeName.toLowerCase()=='br')
						{
						items[0].removeChild(items[0].lastChild);
						}
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
					bbcUtils.replaceElementByTextNodes(items[0],'\r\n-'  + temp, '');
					}
				var lists = elements[i].getElementsByTagName('ul');
				while(lists.length>0)
					bbcUtils.replaceElementByTextNodes(lists[0],'','');
				lists = elements[i].getElementsByTagName('ol');
				while(lists.length>0)
					bbcUtils.replaceElementByTextNodes(lists[0],'','');
				bbcUtils.replaceElementByTextNodes(elements[i],'', '\r\n');
				i--;
				}
			else if(elements[i].tagName.toLowerCase()=='table')
				{
				for(var j=0; j<elements[i].childNodes.length; j++)
					if(elements[i].childNodes[j].nodeName.toLowerCase()=='thead'||elements[i].childNodes[j].nodeName.toLowerCase()=='tfoot'||elements[i].childNodes[j].nodeName.toLowerCase()=='tbody')
						{ bbcUtils.replaceElementByTextNodes(elements[i].childNodes[j],'',''); j--; }
				var tableTd = elements[i].getElementsByTagName('td');
				while(tableTd.length)
					{
					if(tableTd[0].lastChild&&tableTd[0].lastChild.nodeName.toLowerCase()=='br')
						{
						tableTd[0].removeChild(tableTd[0].lastChild);
						}
					bbcUtils.replaceElementByTextNodes(tableTd[0],'| ',' ');
					}
				var tableTh = elements[i].getElementsByTagName('th');
				while(tableTh.length)
					{
					if(tableTh[0].lastChild&&tableTh[0].lastChild.nodeName.toLowerCase()=='br')
						{
						tableTh[0].removeChild(tableTh[0].lastChild);
						}
					bbcUtils.replaceElementByTextNodes(tableTh[0],'| {{','}} ');
					}
				var tableTr = elements[i].getElementsByTagName('tr');
				while(tableTr.length)
					{ bbcUtils.replaceElementByTextNodes(tableTr[0],'','|\n'); }
				var tableCaption = elements[i].getElementsByTagName('caption');
				if(tableCaption.length)
					{
					if(tableCaption[0].lastChild&&tableCaption[0].lastChild.nodeName.toLowerCase()=='br')
						{
						tableCaption[0].removeChild(tableCaption[0].lastChild);
						}
					var tableCaptionContent = tableCaption[0].innerHTML;
					elements[i].removeChild(tableCaption[0]);
					}
				if(elements[i].hasAttribute('summary'))
					{
					bbcUtils.replaceElementByTextNodes(elements[i],'\n\n|| ' + tableCaptionContent + ' | ' + elements[i].getAttribute('summary') + ' ||\n','\n\n'); i--;
					}
				else
					{
					bbcUtils.replaceElementByTextNodes(elements[i],'\n\n|| ' + tableCaptionContent + ' ||\n','\n\n'); i--;
					}
				}
			else if(elements[i].tagName.toLowerCase()=='br')
				{
				bbcUtils.replaceElementByTextNodes(elements[i], '\r\n_', ''); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='h2')
				{
				bbcUtils.replaceElementByTextNodes(elements[i], '\r\n{{{', '}}}\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='h3')
				{
				bbcUtils.replaceElementByTextNodes(elements[i], '\r\n{2{', '}2}\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='h4')
				{
				bbcUtils.replaceElementByTextNodes(elements[i], '\r\n{3{', '}3}\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='h5')
				{
				bbcUtils.replaceElementByTextNodes(elements[i], '\r\n{4{', '}4}\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='h6')
				{
				bbcUtils.replaceElementByTextNodes(elements[i], '\r\n{5{', '}5}\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='hr')
				{
				bbcUtils.replaceElementByTextNodes(elements[i], '\r\n----', '\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='blockquote')
				{
				bbcUtils.replaceElementByTextNodes(elements[i], '\r\n\r\n<quote>', '</quote>\r\n\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='p')
				{
				bbcUtils.replaceElementByTextNodes(elements[i], '\r\n', '\r\n'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='strong')
				{
				bbcUtils.replaceElementByTextNodes(elements[i], '{{', '}}'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='em')
				{
				bbcUtils.replaceElementByTextNodes(elements[i], '{', '}'); i--;
				}
			else if(elements[i].tagName.toLowerCase()=='img')
				{
				bbcUtils.replaceElementByTextNodes(elements[i], '{', '}'); i--;
				}/* Problème images
			else
				{
				bbcUtils.replaceElementByTextNodes(elements[i], '', ''); i--;
				}*/
			}
		var string = editor.innerHTML;
		// Caractere speciaux
		string = string.replace('&nbsp;', '~','g');
		string = string.replace('-&gt;', '>','g');
		string = string.replace('&lt;-', '<','g');
		string = string.replace('&gt;', '>','g');
		string = string.replace('&lt;', '<','g');
		string = string.replace('&amp;', '&','g');
		string = string.replace('&#8594;', '-->','g');
		string = string.replace('&#8592;', '<--','g');
		string = string.replace('&#8596;', '<-->','g');
		string = string.replace('&#82124;', '--','g');
		// Mise en page
		//string = string.replace('<p></p>', '', 'g');
		//string = string.replace('</p><p>', '\r\n\r\n', 'g');
		//string = string.replace('<br>', '\r\n_', 'g');
		//string = bbcUtils.doRegExp(string, /(\r?\n)_ \|/mg, '|');
		//string = bbcUtils.doRegExp(string, /(\r?\n)_(\r?\n)/mg, '\r\n');
		//string = string.replace('</p>', '\r\n', 'g');
		//string = string.replace('<p>', '\r\n', 'g');
		string = bbcUtils.doRegExp(string, /(\r?\n)(\r?\n)(\r?\n)/mg, '\r\n\r\n');
		string = bbcUtils.doRegExp(string, /(?:\r?\n)<\/(quote|code|cadre|poesie)>/, '</$1>','mg');
		string = bbcUtils.doRegExp(string, /<(quote|code|cadre|poesie)>(?:\r?\n)/, '<$1>','mg');
		string = bbcUtils.doRegExp(string, /(?:\r?\n)(\/|\||\))\]/, '$1]','mg');
		string = bbcUtils.doRegExp(string, /\[(\/|\||\()(?:\r?\n)/, '[$1','mg');
		return string.trim();
		},
	inlineMarkups : new Array('a', 'abbr', 'br', 'code', 'sub', 'sup', 'em', 'img', 'q', 'span', 'strong'),
	blockMarkups : new Array('h2', 'hr', 'p', 'ul', 'ol', 'table'),
	superblockMarkups : new Array('blockquote', 'div')
	};
bbcSpipSupport.blockLevelMarkups = [].concat(bbcSpipSupport.blockMarkups,bbcSpipSupport.superblockMarkups);
bbcSpipSupport.acceptedMarkups =
	{
	// Superblock
	"body":
		{"type":"superblock","childs":bbcSpipSupport.blockLevelMarkups},
	"blockquote":
		{"type":"superblock","childs":bbcSpipSupport.blockLevelMarkups
		//,"attributes":["name":"cite","default":"http://","name":"title","default":""]}
		},
	"div":
		{"type":"superblock","childs":bbcSpipSupport.blockLevelMarkups},
	// Block
	"h2":
		{"type":"block","childs":bbcSpipSupport.inlineMarkups},
	"hr":
		{"type":"block","childs":[]},
	"p":
		{"type":"block","childs":bbcSpipSupport.inlineMarkups},
	"ul":
		{"type":"block","childs":['li']},
	"ol":
		{"type":"block","childs":['li']},
	// Listitems
	"li":
		{"type":"list-item","childs":['ul','ol','dl'].concat(bbcSpipSupport.inlineMarkups)},
	// Inline
	"em":
		{"type":"inline","childs":bbcSpipSupport.inlineMarkups},
	"abbr":
		{"type":"inline","childs":bbcSpipSupport.inlineMarkups,"attributes":[{"name":"title","default":"","type":"pleased"}]},
	"strong":
		{"type":"inline","childs":bbcSpipSupport.inlineMarkups},
	"q":
		{"type":"inline","childs":bbcSpipSupport.inlineMarkups},
	"br":
		{"type":"inline","childs":[]},
	"a":
		{"type":"inline","childs":bbcSpipSupport.inlineMarkups,"attributes":[{"name":"onclick","default":""},{"name":"href","default":"http://","type":"needed"},{"name":"title","default":"","type":"pleased"},{"name":"hreflang","default":""}]},
	"img":
		{"type":"inline","childs":[],"attributes":[{"name":"src","default":"","type":"needed"},{"name":"alt","default":"","type":"pleased"},{"name":"style","default":""}]},
	"code":
		{"type":"inline","childs":bbcSpipSupport.inlineMarkups},
	"span":
		{"type":"inline","childs":bbcSpipSupport.inlineMarkups},
	"sub":
		{"type":"inline","childs":bbcSpipSupport.inlineMarkups},
	"sup":
		{"type":"inline","childs":bbcSpipSupport.inlineMarkups},
	// Table
	"table":
		{"type":"block","childs":['caption', 'thead', 'tfoot', 'tbody', 'tr', 'col', 'colgroup'],"attributes":[{"name":"summary","default":""}]},
	"caption":
		{"type":"table-caption","childs":bbcSpipSupport.inlineMarkups},
	"thead":
		{"type":"table-header-group","childs":['tr']},
	"tfoot":
		{"type":"table-footer-group","childs":['tr']},
	"tbody":
		{"type":"table-body-group","childs":['tr']},
	"tr":
		{"type":"table-row","childs":['th', 'td']},
	"td":
		{"type":"table-cell","childs":bbcSpipSupport.inlineMarkups},
	"th":
		{"type":"table-cell","childs":bbcSpipSupport.inlineMarkups},
	"colgroup":
		{"type":"table-column-group","childs":['col']},
	"col":
		{"type":"table-column","childs":[]}
	};