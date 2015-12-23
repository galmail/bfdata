Just playing around with sports api using meteor... feel free to download.

Changes made to BF npm library:

In file betfair_invocation.js:

function BetfairInvocation(api, sessionKey, method, params, isEmulated, appKey){
	
	if(appKey) self.applicationKey = appKey;
  else self.applicationKey = applicationKey;

}

In file betfair_session.js:

function BetfairSession(key) {
	self.appKey = key;
}

function createInvocation(api, methodName) {
	var invocation = new BetfairInvocation(api, self.sessionKey, methodName, params, false, self.appKey);
}

Everytime we change the npm, do: touch packages/npm-container/.npm/package.js




