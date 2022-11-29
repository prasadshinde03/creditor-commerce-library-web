/**  Copyright (c) 2022 Mastercard
 
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
 
    http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

window.zappCreditorCommerceApi = window.zappCreditorCommerceApi || {};

zappCreditorCommerceApi.dspDetail = {};	
dspMetaDataList = {};

zappCreditorCommerceApi.zappCreditorCommerceJourneyTypes = {
	requestToPay: "RequestToPay",
    requestToLink: "RequestToLink"
};
const universalLinkKeys = {
    lifeCycleId: "lifeCycleId",
    businessType: "businessType",
    journeyType: "journeyType"
};

/**
 * Get Dsp Details from DSP list file
 * @param  {String} cdnUrl which is the DSP's manifest file hosted on cdn location
 * @return {Boolean} Generate zappCreditorCommerceApi objects with the DSP's bank details  
 */
zappCreditorCommerceApi.getDspDetails = (cdnUrl) => new Promise(
    function (resolve, reject) {
    	try {
			if(cdnUrl == ""){   //checked if cdnUrl is Empty or not
				throw (new Error("1005"));
			}
			if(cdnUrl.search("https://") != 0) { // check if cdnUrl is start with Secure protocol https or not 
				throw (new Error("1006"));
			} else {
				fetch(cdnUrl)
				.then(function(response) {
					if (response.status !== 200) {
						postError("MC1001" , "Technical error occurred. "+ response.status);
						return;
					}
					return response.text();
				})
				.then(function(text) {
					let decodedRes = "";
					if (text ==="" || text.trim() ===""){  //check Dsp List file empty or not
						throw (new Error("1007"));
					}
					if(!isBase64(text)){   //check if string is not correctly encoded
						throw (new Error("1007"));
					} else {
						decodedRes = JSON.parse(atob(text));
					}
					if(!decodedRes || !decodedRes.apps || !decodedRes.apps.length){  
					// check DspList is empty or not.
						throw (new Error("1007"));
					} else {  
						zappCreditorCommerceApi.dspCount = decodedRes.apps.length;
						for(var i=0 ; i<zappCreditorCommerceApi.dspCount; i++){
							if(decodedRes.apps[i].dspName == undefined || decodedRes.apps[i].dspName == null || decodedRes.apps[i].dspName == ""){   
							//check if dspName is blank or not
								throw (new Error("1007"));
							}
							if(decodedRes.apps[i].dspApiVersion == undefined || decodedRes.apps[i].dspApiVersion == null || decodedRes.apps[i].dspApiVersion == ""){   
							//check if dspApiVersion is blank or not
								throw (new Error("1007"));
							} 
							if(decodedRes.apps[i].dspLogo == undefined || decodedRes.apps[i].dspLogo == null || decodedRes.apps[i].dspLogo == ""){   
							//check if dspLogo path is blank or not
								throw (new Error("1007"));
							}
							if(decodedRes.apps[i].dspUniversalLink == undefined || decodedRes.apps[i].dspUniversalLink == null || decodedRes.apps[i].dspUniversalLink == ""){   
							//check if dspUniversalLink is blank or not
								throw (new Error("1007"));
							}
							if(decodedRes.apps[i].dspUniqueId == undefined || decodedRes.apps[i].dspUniqueId == null || decodedRes.apps[i].dspUniqueId == ""){   
							//check if dspUniqueId is blank or not
								throw (new Error("1007"));
							}
							if(decodedRes.apps[i].appIconHash == undefined || decodedRes.apps[i].appIconHash == null || decodedRes.apps[i].appIconHash == ""){   
							//check if appIconHash string is empty or not
								throw (new Error("1007"));
							}else{
								dspJsonObj = {};
								dspJsonObj.dspUniqueId = decodedRes.apps[i].dspUniqueId;
								dspJsonObj.dspName = decodedRes.apps[i].dspName;
								dspJsonObj.dspLogo = decodedRes.apps[i].dspLogo;
								dspJsonObj.dspApiVersion = decodedRes.apps[i].dspApiVersion;
								dspJsonObj.dspAppIconHash = decodedRes.apps[i].appIconHash;
								zappCreditorCommerceApi.dspDetail[i] = dspJsonObj;
								// zappCreditorCommerceApi meta object having all DSP"s data
								dspMetaDataList[decodedRes.apps[i].dspUniqueId] = decodedRes.apps[i];
							}
						}
						resolve(true);
					}
				})
				.catch(function(err) {
					errorHandler(err.message);
				});
			}
    	}
    	catch(e){
    		errorHandler(e.message);
    	}
    }
);

/**
 * To invoke the mobile banking app
 * @param  {Number} dspId is the unique id of bank 
 * @param  {String} lifeCycleId will either paymentRequestLifeCycleId or agreementLifeCycleId from submit API call
 * @param  {Number} businessType As per business case this paramter required.
 * @param  {String} journeyType to capture which journey user selected
 * @return {String} Generate the universal link and the bank app gets invoked
 */
zappCreditorCommerceApi.invokeApp = function(dspId, lifeCycleId, businessType, journeyType){
	var universalLinkUrl = null;
	if(validateRequestParam(dspId, lifeCycleId, businessType, journeyType)) {
		universalLinkUrl = dspMetaDataList[dspId].dspUniversalLink+"?"+universalLinkKeys.lifeCycleId+"="+lifeCycleId+"&"+universalLinkKeys.businessType+"="+businessType+"&"+universalLinkKeys.journeyType+"="+journeyType;
		window.open(universalLinkUrl, "_blank");
	}
};

/**
 * Custom function to return parameterized universal link from library
 * @param  {Number} dspId is the unique id of bank 
 * @param  {String} lifeCycleId will either paymentRequestLifeCycleId or agreementLifeCycleId from submit API call
 * @param  {Number} businessType As per business case this paramter required.
 * @param  {String} journeyType to capture which journey user selected
 * @return {string}  Generate parameterisedLink 
 */
zappCreditorCommerceApi.getUniversalLink = function(dspId, lifeCycleId, businessType, journeyType) {
	var parameterisedLink = null;
	if(validateRequestParam(dspId, lifeCycleId, businessType, journeyType)) {
		parameterisedLink = dspMetaDataList[dspId].dspUniversalLink+"?"+universalLinkKeys.lifeCycleId+"="+lifeCycleId+"&"+universalLinkKeys.businessType+"="+businessType+"&"+universalLinkKeys.journeyType+"="+journeyType;
		return parameterisedLink;
	}
};

/**
 * This is internal common library function to validate all the parameters from cdn file and invoke function call
 * @param  {Number} dspId is the unique id of bank 
 * @param  {String} lifeCycleId will either paymentRequestLifeCycleId or agreementLifeCycleId from submit API call
 * @param  {Number} businessType As per business case this paramter required.
 * @param  {String} journeyType to capture which journey user selected
 * @return {Throw error} Checks for the error and throw error code so that respective error message gets returned
 */
var validateRequestParam = function(dspId, lifeCycleId, businessType, journeyType) {
	try{
		if(typeof(dspId) === "undefined"){
			throw (new Error("1001"));
		}
		if(typeof(lifeCycleId) === "undefined"){
			if(journeyType && journeyType === zappCreditorCommerceApi.zappCreditorCommerceJourneyTypes.requestToPay){
				throw (new Error("1002"));
			}else if(journeyType && journeyType === zappCreditorCommerceApi.zappCreditorCommerceJourneyTypes.requestToLink){
				throw (new Error("1002"));
			}			
		}
		if(typeof(businessType) === "undefined"){
			throw (new Error("1003"));
		}
		if(dspId === null || dspId.length === 0){
			throw (new Error("1001"));
		}
		if(lifeCycleId === null || lifeCycleId.length === 0){
			if(journeyType && journeyType === zappCreditorCommerceApi.zappCreditorCommerceJourneyTypes.requestToPay){
				throw (new Error("1002"));
			}else if(journeyType && journeyType === zappCreditorCommerceApi.zappCreditorCommerceJourneyTypes.requestToLink){
				throw (new Error("1002"));
			}
		}
		if(businessType === null || businessType.length === 0){
			throw (new Error("1003"));
		}
		if(typeof(dspMetaDataList[dspId]) === "undefined"){
			throw (new Error("1001"));
		}
		if(journeyType !== zappCreditorCommerceApi.zappCreditorCommerceJourneyTypes.requestToPay
		 && journeyType !== zappCreditorCommerceApi.zappCreditorCommerceJourneyTypes.requestToLink){
			throw (new Error("1004"));
		}else {
			return true;
		}
	}
	catch(e){
		errorHandler(e.message);	
	}
};

/**
 * To check given string is in Base64 encoded format or not
 * @param  {String} dspliststr encoded DSP list string value
 * @return {Boolean}  True, if given string is in Base64 else False  
 */
function isBase64(dspliststr) {
    if (dspliststr === "" || dspliststr.trim() === ""){ return false; }   // To check given param is empty
    try {
        return btoa(atob(dspliststr)) == dspliststr;   // To check, Given string is in Base64 encoded format
    } catch (err) {
        return false;
    }
}

/**
 * To handle the errors 
 * @param  {String} errorCode The error code which is defined for specific error type
 */
function errorHandler(errorParam) {
	Object.keys(errorCodeObject).forEach(errorCode => {
		if(errorCode === errorParam) {
			postError(errorParam, errorCodeObject[errorCode]);
		}
	});
}

/**
 * To post given error code and message 
 * @param  {String} eId The error code
 * @param  {String} eDesc The error Description
 * @return {Object}  It generate event and send it merchant with error data object which include error code, description.   
 */
function postError(eId, eDesc) {
	var timeStamp = new Date();
	var errorData = {
		errorCode: eId,
		errorMessage: eDesc
	};
	postData = {
		eventType : "zappCreditorCommerceApiError",
		data : errorData
	};
	const targetOrigin = window.location.protocol + "//" + window.location.hostname;
	window.parent.postMessage(postData, targetOrigin);
}

/**
 * Common object of error codes and messages with key is errorcode and value is error message format
 */
const errorCodeObject = Object.freeze({
	"1001": "DSP Id is invalid.",
	"1002": "Lifecycle id is invalid.",
	"1003": "Business type is invalid.",
	"1004": "Journey type is invalid.",
	"1005": "Unable to reach to configured URL. Please check and reconfigure dsp manifest file URL.",
	"1006": "Invalid protocol, secure protocol HTTPS is only supported.",
	"1007": "Invalid dsp manifest file. Please recheck and configure again."
});