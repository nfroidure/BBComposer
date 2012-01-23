const nsIAutoCompleteSearch = Components.interfaces.nsIAutoCompleteSearch;
const nsISupports = Components.interfaces.nsISupports;

const CLASS_ID = Components.ID("{90437162-c051-4128-ae91-ab6a369cb34c}");
const CLASS_NAME = "Autocomplete with Bookmarks";
const CONTRACT_ID = "@mozilla.org/autocomplete/search;1?name=bookmarks";

function AutoCompleteSearch()
	{
	this.result =
		{
		QueryInterface: function(aIID)
			{
			if (aIID.equals(nsIAutoCompleteResult) || aIID.equals(nsISupports))
				return this;
			throw Components.results.NS_NOINTERFACE;
			},
		results: null,
		comments: null,
		defaultIndex: 0,
		errorDescription: null,
		matchCount: 0,
		searchResult: Components.interfaces.nsIAutoCompleteResult.RESULT_SUCCESS,
		searchString: '',
		getCommentAt: function(index) {return this.comments[index]},
		getStyleAt: function(index) {},
		getValueAt: function(index) {return this.results[index]},
		removeValueAt: function(rowIndex, removeFromDb) {}
		}
	};

AutoCompleteSearch.prototype =
	{
	startSearch: function(searchString, searchParam, previousResult, listener)
		{
		if(this.result.results&&searchString==(this.result.searchString+searchString[this.result.searchString.length]))
			{
			var j;
			for(var i=0; i<this.result.matchCount; i++)
				{
				j=i;
				k=0;
				while(i<this.result.matchCount&&!this.execSearch(this.result.results[i], searchString))
					{
					i++; k++;
					}
				if(k>0)
					{
					this.result.results.splice(j,k);
					this.result.comments.splice(j,k);
					this.result.matchCount = this.result.matchCount-k; i=j;
					}
				}
			}
		else if(searchString!=this.result.searchString)
			{
			// RDF
			var RDF = Components.classes['@mozilla.org/rdf/rdf-service;1'].getService(Components.interfaces.nsIRDFService);
			var RDFChild = RDF.GetResource("http://home.netscape.com/NC-rdf#child");
			var RDFType = RDF.GetResource("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
			var URLType = RDF.GetResource("http://home.netscape.com/NC-rdf#URL");
			var NameType = RDF.GetResource("http://home.netscape.com/NC-rdf#Name");
			// BOOKMARKS
			var bookmarksSource=RDF.GetDataSource("rdf:bookmarks");
			var bookmarksRoot=RDF.GetResource("NC:BookmarksRoot");
			//var bookmarksType = RDF.GetResource("http://home.netscape.com/NC-rdf#Bookmark");

			// GET BOOKMARKS
			this.result.results = new Array();
			this.result.comments = new Array();
			bookmarksSource.beginUpdateBatch();
			var bookmarks=bookmarksSource.GetAllResources();
			while (bookmarks.hasMoreElements())
				{
				var bookmark = bookmarks.getNext();
				if (!(bookmark instanceof Components.interfaces.nsIRDFResource)) continue;
				if (!(bookmarksSource.hasArcOut(bookmark, URLType))) continue;
				var bookmarkURL = bookmarksSource.GetTarget(bookmark, URLType, true);
				var bookmarkName = bookmarksSource.GetTarget(bookmark, NameType, true);
				if(bookmarkURL&&bookmarkName)
					{
					bookmarkURL = bookmarkURL.QueryInterface(Components.interfaces.nsIRDFLiteral).Value;
					bookmarkName = bookmarkName.QueryInterface(Components.interfaces.nsIRDFLiteral).Value;
					if(this.execSearch(bookmarkURL, searchString))
						{
						this.result.results.push(bookmarkURL);
						this.result.comments.push(bookmarkName);
						}
					}
				}
			bookmarksSource.endUpdateBatch();
			}
		this.result.searchString = searchString;
	        this.result.matchCount = this.result.results.length;
        	listener.onSearchResult(this, this.result);
		},

	stopSearch: function() { },

	execSearch: function(url,searchString)
		{
		if(url.indexOf(searchString) == 0
			|| url.replace(/^(?:[a-z]+):\/\/(.*)$/i,'$1').indexOf(searchString) == 0
			|| url.replace(/^(?:[a-z]+):\/\/www\.(.*)$/i,'$1').indexOf(searchString) == 0)
			return true;
		return false;
		},

	QueryInterface: function(aIID)
		{
		if (!aIID.equals(nsIAutoCompleteSearch) && !aIID.equals(nsISupports))
			throw Components.results.NS_ERROR_NO_INTERFACE;
				return this;
		}

	};

var AutoCompleteSearchFactory =
	{
	createInstance: function (aOuter, aIID)
		{
		if (aOuter != null) throw Components.results.NS_ERROR_NO_AGGREGATION;
			return (new AutoCompleteSearch()).QueryInterface(aIID);
		}
	};

var AutoCompleteSearchModule =
	{
	_firstTime: true,
	registerSelf: function(aCompMgr, aFileSpec, aLocation, aType)
		{
		if(this._firstTime)
			{
			this._firstTime = false;
			throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
			};
		aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
		},

	unregisterSelf: function(aCompMgr, aLocation, aType)
		{
		aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);
		},
	getClassObject: function(aCompMgr, aCID, aIID)
		{
		if (!aIID.equals(Components.interfaces.nsIFactory))
			throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
		if (aCID.equals(CLASS_ID))
			return AutoCompleteSearchFactory;
		throw Components.results.NS_ERROR_NO_INTERFACE;
		},

	canUnload: function(aCompMgr) { return true; }
	};

function NSGetModule(aCompMgr, aFileSpec) { return AutoCompleteSearchModule; }
