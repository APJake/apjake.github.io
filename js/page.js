const url = 'https://script.google.com/macros/s/AKfycbx6gxnTr-H-JDmXQ_uuxde-DpvRrL6VvJX1iVeHPCL5BZuJnUkAHly0Gqh1QBYeZFiL/exec';
const alertbox = document.getElementById('error-alert');
const my_content = document.getElementById('my-content');
const my_nav = document.getElementById('my-nav');
const ground = document.getElementById('ground');
const my_view_container = document.querySelector('.my-view');
const loading_ground = document.querySelector('.loading-ground');
const my_view = document.querySelector('.my-view-container .my-view-content');
const pageNumbersContainer = document.querySelector('.numbers-container');

let parcel_data = [];


function shortText(text, max){
    let newText = "";
    let openReg = /<[a-zA-Z0-9]*>/g;
    let closeReg = /<\/[a-zA-Z0-9]*>/g;
    newText = text.replaceAll(openReg, "").replace(closeReg, "");
    return (max>newText.length)?newText:(max>10)?newText.substring(0, max-3)+"...": newText.substring(0,max);
}

function showFullView(j){
    let blog = parcel_data[j];
    let html = '';
    html += `
    <h1>${blog[1]}</h1>
    <small class="text-secondary">Posted on: ${timeSince(new Date(blog[2]))}</small>
    <hr class="right">
    <div class="blog-text">${blog[4]}</div>
    `;
    my_view.innerHTML=html;
    toggleFullView(true);
}

function toggleFullView(show){
    if(show){
        showElement(my_view_container);
    }else{
        hideElement(my_view_container);
    }
}

function makeNextURL(req){
    // let raw = getRawParameters();

    let raw = window.location.href.split('#');
    raw = raw[0].split('?');
    if(raw.length<2)  paras = [];
    else paras = raw[1].split('&');
    let urls = [];
    for(let r of paras){
        let tmp = r.split('=');
        urls[tmp[0]]=tmp[1];
    }
    urls['page']=req.page;
    let rawParamters = [];
    for(let key in urls){
        let value = urls[key];
        rawParamters.push(key+"="+value);
    }
    return raw[0]+"?"+rawParamters.join("&");
}

function givePagination(parcelBlog){
    if(!parcelBlog || Object.keys(parcelBlog).length===0) return '';
    let numbersOfPage = parcelBlog.total_page||1;
    if(numbersOfPage<=1) return '';
    let per = parcelBlog.per||10;
    let page = parcelBlog.page||1;
    let sort = parcelBlog.sort||1;
    // total_page: 5,
    // per: 10,
    // page: 1, 
    // sort: 1,  
    var html = "";
    html += `
    <div class="box mv-20">           
        <div class="page-indicator">
            <div class="numbers-container">
        `;
    // next and ... and 1
    if(page>1){
        html+=`
<a href="${makeNextURL({page:page-1})}" class="page btn prev">
    <i class="fas fa-angle-left"></i> <p>Back</p>
</a>
<a href="${makeNextURL({page:1})}" class="page number">1</a>
        `;
        // html+="prev 1";
    }
    if(page>2){
        html+='<p class="dots">...</p>';
    }
    html+=`<a href="#" class="page number active">${page}</a>`;
    // html+=`(${page})`;
    if(numbersOfPage-1>page){
        html+='<p class="dots">...</p>';
    }
    if(numbersOfPage>page){
        html+=`
<a href="${makeNextURL({page:numbersOfPage})}" class="page number">${numbersOfPage}</a>
<a href="${makeNextURL({page:page+1})}" class="page btn next">
    <p>ရှေ့</p><i class="fas fa-angle-right"></i>
</a>
        `;
        // html+=` ${numbersOfPage} next`;
    }
    html += `</div></div></div>`;
    return html;
}

function setUpBlog(parcelData, parcelBlog){
    parcel_data = parcelData;
    let html = '';
    // init
    html += '<div class="container box vertical center">';

    // title
    html+='<h2>My Blog</h2>';

    // header
    html += givePagination(parcelBlog);

    // body
    html += `<div class="container min-width-200 center box wrap">`;
    for(let j=1; j<parcelData.length; j++){
        let blog = parcelData[j];
        let image = '';
        if(blog[3]) image = `<img src="${blog[3]}" class="img" alt="${shortText(blog[1], 30)}"/>`;
        html += `
<div class="box card border primary-font-pale mx-width-300 mh-10 mv-10">
    <div class="container vertical box">
        ${image}
        <h3>${shortText(blog[1], 30)}</h3>
        <small class="text-small text-secondary">${timeSince(new Date(blog[2]))}</small>
        <p class="p-10">${shortText(blog[4],100)}</p>
        <button class="btn btn-primary-font" onclick="showFullView(${j})">Read more</button>
    </div>
</div>
    `;
    }
    html += `</div>`;

    // done
    html += '</div>';

    my_content.innerHTML = html;
}

function setUpNav(parcelNav){
    let html = '';
    let current = getParameter('r', 'profile');
    for(let j=1; j<parcelNav.length; j++){
        let nav = parcelNav[j];
        let page = nav[3]||"page.html";
        html += `<a href="${page}?r=${nav[2]}" class="${(current===nav[2])?"active":""} home nav-item btn small btn-primary-dark">${nav[1]}</button>`
    }
    my_nav.innerHTML = html;
}

function setUpNested(parcelData){
    let html = '';
    for(let j=1;j<parcelData.length;j++){
        let data = parcelData[j];
        let ui = data[0];
        let title = data[1];
        let parcelType = data[2];
        let parcel = data[3];
        html+="<div class='box center wrap mb-30'>"
        if(title!==""){
            html+=`<h2 id="profile-title mt-20">${title}</h2><hr>`;
        }
        if(ui==='html'){
            html+=parcel;
        }
        // any others
        else{
            // grid or others
            html += giveMeGridHtml(parcel);
        }
        html += "</div>";
    }
    my_content.innerHTML = html;
}

function giveMeAllImages(){}

function giveMeGridHtml(parcelData){
    let html = '<div class="box wrap center horizontal p-20">';
    for(let j=1; j<parcelData.length; j++){
        parcel = parcelData[j];
        let singularHtml = '<div class="min-width-150 min-height-100 box vertical center border card border secondary-pale mh-10 mv-10">';
        for(let i=1; i<parcel.length-1; i+=2){
            let entries = parcel[i].split("|");
            let show_arr = new String(parcel[i+1]).split('|');
            if(entries[0]==="parcent"){
                let value = parseFloat(show_arr[0].trim())*10;
                show_arr[0]=value?value+"%":show_arr[0];
            }
            if(entries[0]==="button"){
                singularHtml+=`<a href="${show_arr[1]}" class="btn btn-secondary-pale mv-10 mh-10 ${entries[1]}">${show_arr[0]}</a>`;
            }
            else if(entries[0]==="img"){
                singularHtml+='<img src="'+show_arr[0]+'" alt="img" class="img mv-10 '+entries[1]+'" />';
            }else{
                singularHtml+='<p class="mh-10 '+entries[1]+'">'+show_arr[0]+'</p>';
            }
        }
        singularHtml+='</div>';
        html+=singularHtml;
    }
    return html+"</div>";
}

function setupBefore(){
    showElement(my_content);
    hideElement(loading_ground);
    toggleAlertBox(false);
    toggleFullView(false);
}

function toggleAlertBox(shown, alert={}){
    if(!shown){
        hideElement(alertbox);
        return;
    }
    let title=alert['title']||"Error";
    let message=alert['message']||"";
    let button1_text=alert['button1_text']||"OK";
    let button2_text=alert['button2_text']||"";
    let button1_handler=alert['button1_handler']||function(){toggleAlertBox(false)};
    let button2_handler=alert['button2_handler']||null;
    const button2 = document.querySelector('#error-alert #error-button2');
    const button1 = document.querySelector('#error-alert #error-button');

    document.querySelector('#error-alert #error-title').innerHTML=title;
    document.querySelector('#error-alert #error-body').innerHTML=message;

    button1.innerHTML=button1_text||"OK";
    button1.addEventListener('click', button1_handler);
    showElement(button1);

    if(button2_handler===null){
        hideElement(button2);
    }else{
        button2.innerHTML=button2_text||"Cancel";
        button2.addEventListener('click', button2_handler);
        showElement(button2);
    }

    showElement(alertbox);
}

function handleError(message, title = ""){
    toggleFullView(false);
    hideElement(my_content)
    toggleAlertBox(true,{
        message,
        title,
        button1_text: 'Go to main',
        button1_handler: function(){
            location.href="index.html";
        },
        button2_text: 'Reload',
        button2_handler: function(){
            location.reload();
        },
    });
}

function dataValidation(data){
    let errorMessage = "Please reload the page or go to main";
    if(!data){
        handleError(errorMessage,"Invalid data");
        return false;
    }
    if(Object.keys(data).length===0){
        handleError(errorMessage, "Empty data");
        return false;
    }
    if(data.status===false){
        handleError(errorMessage, data.message||"Server status false");
        return false;
    }
    if(Object.keys(data.data).length===0){
        handleError(errorMessage, "Empty data");
        return false;
    }
    return true;
}

function setUpNow(data){
    setupBefore();

    try {
        if(dataValidation(data)){
            let parcelData = data.data.data;
            let parcelNav = data.data.nav;
            let type = data.data.data[0][0];
            setUpNav(parcelNav);
            if(type==="nested"){
                setUpNested(parcelData);
            }
            else if(type==="blog"){
                setUpBlog(parcelData, data.data.blog);
            }
            else{
                // text, progress, url, parcent
                let html = giveMeGridHtml(parcelData);
                my_content.innerHTML=html;
            }
        }
    } catch (error) {
        let errorMessage = "Please reload the page or go to main";

        handleError(errorMessage,error.message);
        return false;
        
    }
}

function prepareURL(){
    let raw = getRawParameters();
    return url+raw;
}

function start(){

    toggleFullView(false);
    toggleAlertBox(false);
    hideElement(my_content);
    showElement(loading_ground);

    let starturl = prepareURL();
    fetch(starturl)
    .then(res=>res.json())
    .then(json=>{
        setUpNow(json);
    })
}

let sampleData2 = {
    status: true,
    message: "blah",
    data: {
        nav:[
            [],
            [1, "Blogs", "blog"],
            [4, "Blogs", "home", "index.html"],
            [2, "Profile", "profile"],
            [3, "Projects", "projects"],
        ],
        data:[
            [],
            [1,"img|tiny",'./img/my_pic_1.png', "text", "PHP","parcent|bandage", 8, "button", "Click Me|https://apjake.github.io"],
            [2, "img|icon",'./img/my_pic_1.png',"text", "Python","parcent|bandage", 8.5, "button|small btn-primary-font", "blah|index.html"],
        ]
    }
}

let sampleData3={
    status: true,
    message: 'blah',
    data:{
        nav:[
            [],
            [1, "Blogs", "blog"],
            [2, "Profile", "profile"],
            [3, "Projects", "projects"],
        ],
        blog:{
            // total pages, page per, page index, sort, 
            total_page: 5,
            per: 10,
            page: 1, 
            sort: 1,   
        },
        data:[
            ['blog'],
            [1,"My First Blog", "12/11/2021", "coverphoto","Lorem ipsum dolor sit amet consectetur, adipisicing elit. Maxime corrupti quasi eos, ratione quidem sequi, ducimus ex ea quod non ullam voluptatibus provident aperiam numquam accusamus a laborum nesciunt debitis."],
            [2,"My Second Blog", "12/11/2021", "coverphoto", "Hello world"],
            [3,"My Third Blog", "12/11/2021", "coverphoto", "Lorem ipsum dolor sit amet<br>Example Code:<br><pre>print('hello')</pre> <br>consectetur adipisicing elit. Magnam laborum, nostrum modi porro amet libero asperiores possimus veritatis laboriosam nihil commodi? A tempora neque officia beatae, dolor quod ipsa temporibus quas fugiat sequi dicta commodi exercitationem harum nesciunt dolores voluptatem aliquid molestiae obcaecati est! Velit, hic! A id, deleniti, iusto perferendis at ex consequuntur quam nobis animi esse pariatur nihil illum harum quis, incidunt quasi qui? Repudiandae cumque sint, dolor iure cum aut accusantium minus illo animi ad ducimus odio soluta rerum vero eligendi a! Ab quidem, quis inventore dolore illo sequi, eius laboriosam illum repellendus laborum ipsa est pariatur. Labore officiis, repellendus ipsam vel vitae harum molestias aliquid autem. Molestias, consequuntur ratione. Molestias, ipsa a. Deserunt, labore! Praesentium consequatur vero provident aperiam iste dicta necessitatibus sapiente! Similique consequuntur quaerat quae ea eius iusto aperiam alias laborum excepturi molestiae illum autem accusantium, perspiciatis quia quo non modi incidunt ipsum voluptatibus vitae explicabo praesentium! Nostrum, ut. Natus, officiis saepe. Omnis tempora veritatis libero accusamus non porro corporis, dolorum ullam amet illo quos minus suscipit tenetur quod eaque praesentium! Dicta, adipisci veritatis! Fugiat labore est veritatis iusto quaerat accusamus molestias nisi eveniet sint odio sequi consequuntur explicabo qui fuga provident cupiditate ducimus, dolorum molestiae placeat. Dicta maiores corrupti ex sunt natus illum nulla perferendis, suscipit molestias laudantium culpa explicabo porro consequatur voluptatum nisi inventore fugiat, doloribus voluptate accusamus officiis quisquam rerum beatae! Perferendis delectus animi similique repudiandae ex. Quidem perspiciatis magnam iure minima ea corporis, voluptatum ratione est, modi repudiandae soluta et totam aliquam tempora iste saepe quas in nobis, fugit eum ipsum. Fuga, minima. Laborum voluptatum natus eveniet dolorum accusamus illum provident magnam sapiente illo iste, fugiat vero aliquam autem quaerat ab maiores at reprehenderit alias error modi. Facere aspernatur sunt, rerum fugiat tempore sit provident accusantium blanditiis natus, ratione eum!"],
        ]
    }
}


let sampleData = {
    status: true,
    message: "blah",
    data: {
        data:[
            ['nested'],
            ['html', '', 'innerhtml', `<h2 id="profile-title">About Me</h2>
            <hr>
            <div id="profile-card" class="mt-60 box card border primary-font vertical width-330">
            <img src="./img/my_pic_2_500.png" id="profile-img" alt="Aung Minn Khant" class="float profile-image">
            <p class="pt-10 text-pale pt-40">Name: <span class="text-secondary text-bold ph-10">Aung Minn Khant</span></p>
            <p class="pt-10 text-pale">Age: <span class="text-secondary text-bold my-age ph-10"></span></p>
            <p class="pt-10 text-pale">Post: <span class="text-secondary text-bold ph-10">Full-Stack Developer (Web, Android)</span></p>
            <p class="pt-10 text-pale">Country: <span class="text-secondary text-bold ph-10">Myanmar (Burmese)</span></p>
            <p class="pt-10 text-pale">Major: <span class="text-secondary text-bold ph-10">Computer Science</span></p>
            <p class="pt-10 text-pale">University: <span class="text-secondary text-bold ph-10">University of Computer Studied, Yangon (UCSY)</span></p>
            </div>`, ],
            ['grid', 'Language Skills', 'sheet', [
                [],
                [1, "text", "PHP","parcent|bandage", 8],
                [2, "text", "Python","parcent|bandage", 8.5],
            ]],
            ['grid', 'Frameworks Skills', 'sheet', [
                [],
                [1, "text", "PHP","parcent", 8],
                [2, "text", "Python","parcent", 8.5],
            ]]
        ],
    }
}

// setUpNow(sampleData3);
// setupBefore();

start();