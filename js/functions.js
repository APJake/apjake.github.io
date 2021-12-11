htmlEncode = (s) => {
    var el = document.createElement("div");
    el.innerText = el.textContent = s;
    s = el.innerHTML;
    return s;
}

getImgId=link=>link.match(/file\/d\/(.*)\//)[1]


hideElement=ele=>{
    ele.style='display:none;';
}
showElement=ele=>{
    ele.style='';
}

setText = (text,color='dark') => `<p class="font-${color} font-small text-center">${text}</p>`;

storeItem=(key,value)=>sessionStorage.setItem(key,value);
retrieveItem=(key)=>sessionStorage.getItem(key);
removeItem=key=>sessionStorage.removeItem(key);
clearAllItem=()=>sessionStorage.clear();

setLoginSession=(session)=>storeItem('lxo-login',session);
getLoginSession=()=>retrieveItem('lxo-login');
doLogout=()=>removeItem('lxo-login');

sortMe=(array,reverse=1)=> array.sort((a,b)=>reverse*((a.priority>b.priority)?1:(a.priority<b.priority)?-1:0));

checkParameter = parameter => {
    if (!parameter) return false;
    var letterNumber = /^[0-9a-zA-Z_./-]+$/;
    if (parameter.match(letterNumber)) return true;
    else return false;
}

getParameters = (para, def) => {
    var url = new URL(window.location.href);
    var urls = url.searchParams.getAll(para);
    for (var u of urls) {
        if (!checkParameter(u)) return def;
    }
    return urls;
}
getParameter = (para, def) => {
    var url = new URL(window.location.href);
    var url = url.searchParams.get(para);
    if (!checkParameter(url)) return def;
    return url.toString().trim();
}

getRawParameters = () => {
    var url = new URL(window.location.href);
    return url.search;
}
function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = seconds / 31536000;
    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  }