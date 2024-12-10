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
  console.log('Count Everything in releases');
  // find page entries with class pgdownload
  downs = document.getElementsByClassName('pgdownload');
  for (let i = 0; i < downs.length; i++) {
    aDown = downs[i];
    txt = aDown.textContent;
    console.log(txt);
    countEntry(txt);
  }
}

function countEntry(name) {
  console.log('counting stuff in ' + name);
  // need to work out what we have in terms of root, user/repository/release/version/specific file 
  let nameStr = new String(name);
  let ghp = nameStr.indexOf(gitRoot);
  if (ghp<0) {
    console.log('Unable to find api root ' +gitRoot);
    return;
  }
  nameStr = nameStr.substring(ghp+gitRoot.length);
  console.log(nameStr);
  let nameBits = nameStr.split('/');
  console.log('Split into ' + nameBits.length + ' parts')
}

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
  $.getJSON(url, findRelease).fail(findRelease);
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
    console.log("Current content is " + curr);
    aNode.textContent = (curr + "; " + downCount + " Downloads ")
	}
  
  

}