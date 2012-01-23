const nsIAutoCompleteSearch = Components.interfaces.nsIAutoCompleteSearch;
const nsISupports = Components.interfaces.nsISupports;

const CLASS_ID = Components.ID("{90437162-c051-4128-ae91-a456969cb34c}");
const CLASS_NAME = "Autocomplete with History + Bookmarks";
const CONTRACT_ID = "@mozilla.org/autocomplete/search;1?name=historybookmarks";

function AutoCompleteSearch()
	{
	// HISTORIC
	this.historyAutocomplete = Components.classes['@mozilla.org/autocomplete/search;1?name=history'].getService(Components.interfaces.nsIAutoCompleteSearch);
	// BOOKMARKS
	this.bookmarksAutocomplete = Components.classes['@mozilla.org/autocomplete/search;1?name=bookmarks'].getService(Components.interfaces.nsIAutoCompleteSearch);
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
		styles: null,
		defaultIndex: 0,
		errorDescription: null,
		matchCount: 0,
		searchResult: Components.interfaces.nsIAutoCompleteResult.RESULT_SUCCESS,
		searchString: '',
		getCommentAt: function(index) {return this.comments[index]},
		getStyleAt: function(index) {return this.styles[index]},
		getValueAt: function(index) {return this.results[index]},
		removeValueAt: function(rowIndex, removeFromDb) {}
		}

	};

AutoCompleteSearch.prototype =
	{
	startSearch: function(searchString, searchParam, previousResult, listener)
		{
		this.result.results = new Array();
		this.result.comments = new Array();
		this.result.styles = new Array();
		this.historyAutocomplete.startSearch(searchString, searchParam, previousResult, listener);
		for(var i=0; i<this.historyAutocomplete.GetMatchCount(); i++)
			{
			this.result.results.push(this.historyAutocomplete.getValueAt(i));
			this.result.comments.push(this.historyAutocomplete.getCommentAt(i));
			this.result.styles.push(this.historyAutocomplete.getStyleAt(i));
			if(i==this.historyAutocomplete.result.defaultIndex)
				this.result.defaultIndex = i;
			}
		this.bookmarksAutocomplete.startSearch(searchString, searchParam, previousResult, listener);
		for(var i=0; i<this.bookmarksAutocomplete.result.matchCount; i++)
			{
			this.result.results.push(this.bookmarksAutocomplete.getValueAt(i));
			this.result.comments.push(this.bookmarksAutocomplete.getCommentAt(i));
			this.result.styles.push(this.bookmarksAutocomplete.getStyleAt(i));
			}
		this.result.searchString = searchString;
	        this.result.matchCount = this.result.results.length;
        	listener.onSearchResult(this, this.result);
		},

	stopSearch: function() { this.historyAutocomplete.stopSearch(); this.bookmarksAutocomplete.stopSearch(); },

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
