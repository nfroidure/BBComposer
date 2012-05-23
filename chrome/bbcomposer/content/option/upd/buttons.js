function defaults()
	{
	document.getElementById('upload.on').checked=true;
	document.getElementById('upload.site').value='http://skyhell3.free.fr';
	document.getElementById('upload.folder').value='images/';
	document.getElementById('upload.url').value='index.php3';
	document.getElementById('upload.postname').value='bbfile';
	document.getElementById('upload.postfilename').value='bbfilename';
	document.getElementById('upload.postparams').value='';
	document.getElementById('upload.unique').checked=true;
	}
function ewk()
	{
	document.getElementById('upload.on').checked=true;
	document.getElementById('upload.site').value='';
	document.getElementById('upload.folder').value='images/';
	document.getElementById('upload.url').value='index.php?href=administration&context=module1&action=uploaded&order=upload&type=xcmsml';
	document.getElementById('upload.postname').value='bbfile';
	document.getElementById('upload.postfilename').value='bbfilename';
	document.getElementById('upload.postparams').value='';
	document.getElementById('upload.unique').checked=true;
	}