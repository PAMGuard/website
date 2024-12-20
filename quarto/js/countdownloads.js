var apiRoot = "https://api.github.com/";
var gitRoot = "github.com/";


// adapted from https://github.com/Somsubhra/github-release-stats/blob/master/js/main.js#L189
var releaseData;
var currentRelease;
var downCount;

// Return a HTTP query variable
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for(var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable) {
            return pair[1];
        }
    }
    return "";
}

function fTest() {
  console.log('Test function cll');
  fx("V2.02.14");
}

function countEverything() {
  //console.log('Count Everything in releases');
  // find page entries with class pgdownload
  downs = document.getElementsByClassName('pgdownload');
  for (let i = 0; i < downs.length; i++) {
    aDown = downs[i];
  //  txt = aDown.textContent;
//    console.log('-' + txt + '-');
    //let count = 
    name = new String(aDown.textContent);
    //console.log(name);
    if (name.indexOf('github.com')>0) {
      countEntry(aDown);
    }
    else if (name.indexOf('zenodo.')>0) {
      countZenodo(aDown);
    }
    //txt = txt + ' Total Downloads = ' + count;
    //aDown.textContent = txt;
  }
}


function countEntry(aDown) {
  //console.log('counting stuff in ' + name);
  // need to work out what we have in terms of root, user/repository/release/version/specific file 
  // typical name is https://github.com/PAMGuard/PAMGuard/releases/download/V2.02.13/Setup-Pamguard_2_02_13.exe 
  name = aDown.textContent;
  let nameStr = new String(name);
  let ghp = nameStr.indexOf(gitRoot);
  if (ghp<0) {
    console.log('Unable to find api root ' +gitRoot);
    return 0;
  }
  nameStr = nameStr.substring(ghp+gitRoot.length);
  //console.log(nameStr);
  let nameBits = nameStr.split('/');
  //console.log('Split into ' + nameBits.length + ' parts')
  let account = null;
  let repo = null;
  let tag = null;
  let file = null;
  if (nameBits.length >= 1) {
    account = nameBits[0];
  }
  if (nameBits.length >= 2) {
    repo = nameBits[1];
  }
  if (nameBits.length >= 5) {
    tag = nameBits[4];
  }
  if (nameBits.length >= 6) {
    file = nameBits[5];
  }
  //console.log('account: ' + account + ', repo: ' + repo + ', tag: ' + tag + ', file: ' + file)
  countFile(aDown, account, repo, tag, file);
}

function countFile(aDown, account, repo, tag, file) {
  // file can be null, in which case all files in release will be counted. 
  var url = apiRoot + "repos/" + account + "/" + repo + "/releases";
 // console.log('send query: ' + url);
 /*
 The JSON query executes asynchronously, so it's not really possible to do much
 apart from do the update to the page within the json callback function. Otherwise
 would have to go synchronous which could stop the entire web page while it executes
 so will get bad if very poor internet. 
 */
  $.getJSON(url, {}, function(data) {
    var nAsset = 0;
    //console.log(data);
    const body = document.body;
    table = document.createElement('table')
    table.setAttribute('border', '1');
    var th = table.insertRow();
    var td = th.insertCell();
    td.appendChild(document.createTextNode("Tag Name"));
    var td = th.insertCell();
    td.appendChild(document.createTextNode("Asset Name"));
    td = th.insertCell();
    td.appendChild(document.createTextNode("Created"));
    td = th.insertCell();
    td.appendChild(document.createTextNode("Download Count"));
    // now need to work through and find the tag, unless it's null. 
    //nAsset = nAsset + 1 + data.length;
    for (let t = 0; t < data.length; t++) {
      aTag = data[t];
      
      if (tag != null && tag != aTag.tag_name) {
        continue;
      }
      // now find the asset	  
      for (let a = 0; a < aTag.assets.length; a++){
        asset = aTag.assets[a];
        if (file == null || file == asset.name) { 
         // console.log(asset)
	        nAsset +=  asset.download_count;
          //console.log('new ' + asset.download_count + ' total ' + nAsset);
          //table += '<tr><td>' + asset.name + '</td><td>' + asset.download_count + '</td></tr>'
          var th = table.insertRow();
          var td = th.insertCell();
          td.appendChild(document.createTextNode(aTag.tag_name));
          var td = th.insertCell();
          td.appendChild(document.createTextNode(asset.name));
          td = th.insertCell();
          var dateStr = asset.created_at;
          if (dateStr != null) {
            dateStr = dateStr.replace('T', ' ');
            dateStr = dateStr.replace('Z', '');
          }
          td.appendChild(document.createTextNode(dateStr));
          td = th.insertCell();
          td.appendChild(document.createTextNode(asset.download_count));
        }
      }
    }
    var th = table.insertRow();
    var td = th.insertCell();
    td.setAttribute('colspan', 3);
    td.setAttribute('align', 'right')
    td.appendChild(document.createTextNode("Total Downloads"));
    td = th.insertCell();
    td.appendChild(document.createTextNode(nAsset));
    txt = aDown.textContent + ' Total Downloads = ' + nAsset;
    aDown.textContent = txt;
    //body.appendChild(table);
    //console.log(aDown);
    //console.log(aDown.parentNode);
    parent = aDown.parentNode;
    parent.insertBefore(table, aDown);
    parent.insertBefore(aDown, table);
    //return nAsset;
  }).fail(function(data) {
    errStr = getErrorString(data.status);
    txt = aDown.textContent + ': Error ' + data.status + '. ' + errStr;
    aDown.textContent = txt;
  });
}

function countZenodo(aDown) {
  name = aDown.textContent;
  let nameStr = new String(name);
  zind = nameStr.indexOf('zenodo.');
  zId = nameStr.substring(zind + 7);
  zJson = 'https://zenodo.org/api/records/'+zId;
  //console.log('Counting Zenodo entry ' + zJson);
  $.getJSON(zJson, {}, function(data) {
    var nAsset = 0;
    //console.log(data);
    const body = document.body;
    table = document.createElement('table')
    table.setAttribute('border', '1');
    var th = table.insertRow();
    var td = th.insertCell();
    td.appendChild(document.createTextNode("Version"));
    var td = th.insertCell();
    td.appendChild(document.createTextNode("Views"));
    td = th.insertCell();
    td.appendChild(document.createTextNode("Downloads"));
    
    // try to find the data we're after in the returned json. 
    let tit = data.title;
    let version = data.metadata.version;
    stats = data.stats;
    //console.log(stats);
    let downloads = stats.downloads;
    let unique_downloads = stats.unique_downloads;
    let views = stats.views;
    let unique_views = stats.unique_views;
    let version_downloads = stats.version_downloads;
    let version_unique_downloads = stats.version_unique_downloads;
    let version_unique_views = stats.version_unique_views;
    let version_views = stats.version_views;
    
    var th = table.insertRow();
    var td = th.insertCell();
    td.appendChild(document.createTextNode("All Versions"));
    var td = th.insertCell();
    td.appendChild(document.createTextNode(views));
    var td = th.insertCell();
    td.appendChild(document.createTextNode(downloads));
    
    var th = table.insertRow();
    var td = th.insertCell();
    td.appendChild(document.createTextNode('Version ' + version));
    var td = th.insertCell();
    td.appendChild(document.createTextNode(version_views));
    var td = th.insertCell();
    td.appendChild(document.createTextNode(version_downloads));
    
    parent = aDown.parentNode;
    aDown.textContent += '\u000A'
    
    parent.insertBefore(table, aDown);
    parent.insertBefore(aDown, table);
    titnode = document.createTextNode(tit);
    parent.insertBefore(titnode, table);
    
  }).fail(function(data) {
    errStr = getErrorString(data.status);
    txt = aDown.textContent + ': Error ' + data.status + '. ' + errStr;
    aDown.textContent = txt;
    //console.log('Error executing ' + zJson);
  });
}

function getErrorString(status) {
  switch (status) {
    case 403:
      return "You've exceeded GitHub's rate limit. Try again in about an hour.";
    case 404:
      return "Unknown project";
    default:
      return "Unknown error " + status;
  }
}

/*function reportErr(aDown) {
  console.log("Error getting json data");
    txt = aDown.textContent + ': Error retreiving data';
    aDown.textContent = txt;
}*/
/*function CallMethod() {
     $.getJSON('/website/RESTfulService.svc/LiveLocation/json', 
     {
        x: "1",
        y: "2"
     }, 
     function(data) {
         getResult(data.lat, data.lon);
     });
}
*/


function countRelease(text="null string") {    
  currentRelease = text;
  //releaseData = null;
  //console.log("Settng current release " + currentRelease);   
  var page = getQueryVariable("page") || 1;
  var perPage = getQueryVariable("per_page") || 5
  var url = apiRoot + "repos/" + "PAMGuard" + "/" + "PAMGuard"+ "/releases";
  // +
  //       "?page=" + page + "&per_page=" + perPage;
  console.log(url)
// looking for a tag name along lines of "tag_name": "V2.02.14"
//var allres = "";
  $.getJSON(url, findRelease(data)).fail(findRelease);
  //console.log("found tag is now " + releaseData)


};

function countDownloads(rData) {

  return 0;
}

function findRelease(data)
{
   //console.log("Searching for " + currentRelease);    
   var err = false;
    var errMessage = '';

    if(data.status == 404) {
        err = true;
        errMessage = "The project does not exist!";
    }    
    if(data.status == 403) {
        err = true;
        errMessage = "You've exceeded GitHub's rate limiting.<br />Please try again in about an hour.";
    }

    if(data.length == 0) {
        err = true;
        errMessage = getQueryVariable("page") > 1 ? "No more releases" : "There are no releases for this project";
    }

    var locCopy = null;

	  var count = 0;
    
    $.each(data, function(index, item) {
            var releaseTag = item.tag_name;
	  if (releaseTag == currentRelease) {       
	    locCopy= item;
	    //console.log("found " + releaseTag + "   " + locCopy)
	    //return locCopy;
	    // do the counting here then. 
	    $.each(locCopy.assets, function(index, asset) {
	      count += asset.download_count;
	    });
    	
	  }
	

   })
  //console.log("download count is " + count)
	downCount = count;
	if (downCount > 0) {
    //document.getElementById("downcount").textContent=(" " + downCount + " Downloads ");
    var y = document.getElementsByClassName('quarto-title-meta-contents');
    var aNode = y[0];
    var curr = aNode.textContent;
    //console.log(aNode);
    //console.log("Current content is " + curr);
    aNode.textContent = (curr + "; " + downCount + " Downloads ")
	}
  
  

}