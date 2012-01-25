// INITIALIzATION
function openPropertyDialog(file, value)
	{
	var params = {inn:{property:value}, out:null};
	window.openDialog(file, "", "chrome, dialog, modal, resizable=no", params).focus();
	if(params.out&&params.out.property)
		{
		return params.out.property;
		}
	else
		return false;
	}
function setProperty(propertyName)
	{
	var value = openPropertyDialog("chrome://bbcomposer/content/style/"+propertyName+".xul", document.getElementById(propertyName).value);
	if(value)
		document.getElementById(propertyName).value = value;
	}
function setSize(propertyName)
	{
	var value = openPropertyDialog("chrome://bbcomposer/content/style/size.xul", document.getElementById(propertyName).value)
	if(value)
		document.getElementById(propertyName).value = value;
	}

function setAllSizes(size_type)
	{
	var size = openPropertyDialog("chrome://bbcomposer/content/style/size.xul", "");
	if(size)
		{
		document.getElementById(size_type + "-left").value = size;
		document.getElementById(size_type + "-right").value = size;
		document.getElementById(size_type + "-top").value = size;
		document.getElementById(size_type + "-bottom").value = size;
		}
	}

function style_init()
	{
	document.removeEventListener('load', style_init, false);
	if(window.parent.myBBComposerManager.toggleSidebar('css', true))
		{
		window.parent.myBBComposerManager.focusedBBComposer.getElementStyle(document.getElementById('bbcomposer-lockon-menu').value);
		document.addEventListener('unload', style_uninit, false);
		}
	}

function style_uninit()
	{
	document.removeEventListener('unload', style_uninit, false);
	window.parent.myBBComposerManager.toggleSidebar('css',false);
	}

window.addEventListener('load', style_init, false);