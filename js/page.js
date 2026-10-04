const url =
  "https://script.google.com/macros/s/AKfycbx6gxnTr-H-JDmXQ_uuxde-DpvRrL6VvJX1iVeHPCL5BZuJnUkAHly0Gqh1QBYeZFiL/exec";

const YOUTUBE_BASE_URL = "https://www.youtube.com/embed/";
const alertbox = document.getElementById("error-alert");
const my_content = document.getElementById("my-content");
const my_nav = document.getElementById("my-nav");
const ground = document.getElementById("ground");
const my_view_container = document.querySelector(".my-view");
const loading_ground = document.querySelector(".loading-ground");
const my_view = document.querySelector(".my-view-container .my-view-content");
const pageNumbersContainer = document.querySelector(".numbers-container");

let parcel_data = [];

function shortText(text, max) {
  let newText = "";
  let openReg = /<[a-zA-Z0-9]*>/g;
  let closeReg = /<\/[a-zA-Z0-9]*>/g;
  newText = text.replaceAll(openReg, "").replace(closeReg, "");
  return max > newText.length
    ? newText
    : max > 10
    ? newText.substring(0, max - 3) + "..."
    : newText.substring(0, max);
}

function showFullView(j) {
  let newurl = new URL(prepareURL());
  if (newurl.searchParams.get("id") !== null) {
    newurl.searchParams.delete("id");
  }
  newurl.searchParams.append("id", j);
  window.history.pushState("", "", newurl.search);

  let blog = parcel_data[j];
  let html = "";
  html += `
    <h1>${blog[1]}</h1>
    <small class="text-secondary">Posted on: ${timeSince(
      new Date(blog[2])
    )}</small>
    <hr class="right">
    <div class="blog-text">${blog[4]}</div>
    `;
  my_view.innerHTML = html;
  toggleFullView(true);
}

function showFullViewDetail(j) {
  let newurl = new URL(prepareURL());
  if (newurl.searchParams.get("id") !== null) {
    newurl.searchParams.delete("id");
  }
  newurl.searchParams.append("id", j);
  window.history.pushState("", "", newurl.search);

  let blog = parcel_data[j];
  // categories
  let categories = blog[5].split("|");
  let catHtml = "<div class='box horizontal wrap mv-10'>";
  categories.forEach((cat) => {
    catHtml += `<div class='bandage secondary m-2'>${cat}</div>`;
  });
  catHtml += "</div>";

  let images = [];
  if (blog[7]) images = blog[7]?.split("|");
  let imgLength = images.length;
  let imgContainer = "";

  if (imgLength > 0) {
    imgContainer = '<div class="slideshow-container"><div class="slidebox">';
    for (let i = 0; i < imgLength; i++) {
      let img = images[i];
      imgContainer += `
      <div class="mySlides fade">
          <div class="numbertext">${i + 1} / ${imgLength}</div>
          <img class="slide-img" src="${getImageURL(img)}" />
          <div class="slider-text"></div>
      </div>
          `;
    }
    if (imgLength > 1) {
      imgContainer += `
        <a class="slider-prev" onclick="plusSlides(-1)">&#10094;</a>
        <a class="slider-next" onclick="plusSlides(1)">&#10095;</a>
        `;
    }
    imgContainer += "</div><br>"; // img box close and br

    imgContainer += '<div class="slider-dot-container">'; // dot container
    images.forEach((img) => {
      imgContainer +=
        '<span class="slider-dot" onclick="currentSlide(1)"></span>';
    });

    imgContainer += "</div>"; // dot container close
    imgContainer += "</div>"; // main close
  } // img done

  let videoContainer = "";
  // for video
  if (blog[8]) {
    videoContainer = `
    <br>
    <iframe width="90%" 
        src="${YOUTUBE_BASE_URL + getYoutubeKeyFromURL(blog[8])}"
        allowfullscreen="allowfullscreen"
        mozallowfullscreen="mozallowfullscreen" 
        msallowfullscreen="msallowfullscreen" 
        oallowfullscreen="oallowfullscreen" 
        webkitallowfullscreen="webkitallowfullscreen"
        >
    </iframe>
  `;
  }

  let html = "";
  html += `
    <h1>${blog[1]}</h1>
    <small class="text-secondary">Posted on: ${timeSince(
      new Date(blog[2])
    )}</small>
    <hr class="right">
    ${catHtml}
    ${imgContainer}
    <div class="blog-text">${blog[6]}</div>
    ${videoContainer}
    `;

  // for extra views
  html += giveMeExtraGridHTML(blog.slice(9));
  my_view.innerHTML = html;
  // start slide
  slideIndex = 1;
  if (imgLength > 0) showSlides(slideIndex);
  toggleFullView(true);
}

function giveMeExtraGridHTML(extraData) {
  let html = '<div class="box wrap center horizontal p-20">';
  let singularHtml =
    '<div class="min-width-150 min-height-100 box vertical center mh-10 mv-10">';
  for (let i = 1; i < extraData.length - 1; i += 2) {
    let entries = extraData[i].split("|");
    let show_arr = new String(extraData[i + 1]).split("|");
    if (entries[0] === "parcent") {
      let value = parseFloat(show_arr[0].trim()) * 10;
      show_arr[0] = value ? value + "%" : show_arr[0];
    }
    if (entries[0] === "button") {
      singularHtml += `<a href="${show_arr[1]}" class="btn mv-10 mh-10 ${entries[1]}">${show_arr[0]}</a>`;
    } else if (entries[0] === "img") {
      singularHtml +=
        '<img src="' +
        show_arr[0] +
        '" alt="img" class="img mv-10 ' +
        entries[1] +
        '" />';
    } else {
      singularHtml +=
        '<p class="mh-10 ' + entries[1] + '">' + show_arr[0] + "</p>";
    }
  }
  singularHtml += "</div>";
  html += singularHtml;

  return html + "</div>";
}

function toggleFullView(show) {
  if (show) {
    showElement(my_view_container);
  } else {
    hideElement(my_view_container);
  }
}

function makeNextURL(req) {
  // let raw = getRawParameters();

  let raw = window.location.href.split("#");
  raw = raw[0].split("?");
  if (raw.length < 2) paras = [];
  else paras = raw[1].split("&");
  let urls = [];
  for (let r of paras) {
    let tmp = r.split("=");
    urls[tmp[0]] = tmp[1];
  }
  urls["page"] = req.page;
  let rawParamters = [];
  for (let key in urls) {
    let value = urls[key];
    rawParamters.push(key + "=" + value);
  }
  return raw[0] + "?" + rawParamters.join("&");
}

function givePagination(parcelBlog) {
  if (!parcelBlog || Object.keys(parcelBlog).length === 0) return "";
  let numbersOfPage = parcelBlog.total_page || 1;
  if (numbersOfPage <= 1) return "";
  let per = parcelBlog.per || 10;
  let page = parcelBlog.page || 1;
  let sort = parcelBlog.sort || 1;
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
  if (page > 1) {
    html += `
<a href="${makeNextURL({ page: page - 1 })}" class="page btn prev">
    <i class="fas fa-angle-left"></i> <p>Back</p>
</a>
<a href="${makeNextURL({ page: 1 })}" class="page number">1</a>
        `;
    // html+="prev 1";
  }
  if (page > 2) {
    html += '<p class="dots">...</p>';
  }
  html += `<a href="#" class="page number active">${page}</a>`;
  // html+=`(${page})`;
  if (numbersOfPage - 1 > page) {
    html += '<p class="dots">...</p>';
  }
  if (numbersOfPage > page) {
    html += `
<a href="${makeNextURL({
      page: numbersOfPage,
    })}" class="page number">${numbersOfPage}</a>
<a href="${makeNextURL({ page: page + 1 })}" class="page btn next">
    <p>ရှေ့</p><i class="fas fa-angle-right"></i>
</a>
        `;
    // html+=` ${numbersOfPage} next`;
  }
  html += `</div></div></div>`;
  return html;
}

function setUpBlog(parcelData, parcelBlog) {
  parcel_data = parcelData;
  let viewId = getParameter("id");
  if (viewId !== undefined) {
    let index = parcel_data.findIndex((a) => {
      return a[0] == viewId;
    });
    if (index > -1) showFullViewDetail(index);
  }
  let html = "";
  // init
  html += '<div class="container box vertical center">';

  // title
  html += "<h2>My Blog</h2>";

  // header
  html += givePagination(parcelBlog);

  // body
  html += `<div class="container min-width-200 center box wrap">`;
  for (let j = 1; j < parcelData.length; j++) {
    let blog = parcelData[j];
    let image = "";
    if (blog[3])
      image = `<img src="${getImageURL(blog[3])}" class="img" alt="${shortText(
        blog[1],
        30
      )}"/>`;
    html += `
<div class="box card border primary-font-pale mx-width-300 mh-10 mv-10">
    <div class="container vertical box">
        ${image}
        <h3>${shortText(blog[1], 30)}</h3>
        <small class="text-small text-secondary">${timeSince(
          new Date(blog[2])
        )}</small>
        <p class="p-10">${shortText(blog[4], 100)}</p>
        <button class="btn btn-primary-font" onclick="showFullView(${j})">Read more</button>
    </div>
</div>
    `;
  }
  html += `</div>`;

  // done
  html += "</div>";

  my_content.innerHTML = html;
}

function setUpCusBlog(parcelData, parcelBlog) {
  parcel_data = parcelData;
  let viewId = getParameter("id");

  if (viewId !== undefined) {
    let index = parcel_data.findIndex((a) => {
      return a[0] == viewId;
    });
    if (index > -1) showFullViewDetail(index);
  }
  let html = "";
  // init
  html += '<div class="container box vertical center">';

  // title
  if (parcel_data[0][1] !== "") html += `<h2>${parcel_data[0][1]}</h2>`;

  // header
  html += givePagination(parcelBlog);

  // body
  html += `<div class="container min-width-200 center box wrap">`;
  for (let j = 1; j < parcelData.length; j++) {
    let blog = parcelData[j];
    let image = "";

    // index 4
    let tmpArr = blog[4].split("|");
    let orientation = tmpArr[0] || "vertical";
    if (screen.width < 500) {
      orientation = "vertical";
    }
    let width = parseInt(tmpArr[1]);
    let height = parseInt(tmpArr[2]);

    // index 5
    let categories = blog[5].split("|");
    let catHtml = "<div class='box horizontal wrap mv-10'>";
    categories.forEach((cat) => {
      catHtml += `<div class='bandage secondary m-2'>${cat}</div>`;
    });
    catHtml += "</div>";

    let buttonHtml = `<button class="btn small btn-primary-font" onclick="showFullViewDetail(${j})">VIEW PROJECT</button>`;

    let boxStyle = "";
    if ((width !== NaN || height !== NaN) && screen.width > 500) {
      boxStyle = 'style="';
      if (width !== NaN) {
        boxStyle += `width:${width}px;`;
      }
      if (height !== NaN) {
        boxStyle += `height:${height}px;`;
      }
      boxStyle += '"';
    }
    if (blog[3])
      image = `<img src="${getImageURL(blog[3])}" class="img${
        orientation === "horizontal" ? "-v" : "-h"
      }" alt="${shortText(blog[1], 30)}"/>`;

    if (orientation === "horizontal") {
      // for horizontal
      html += `
    <div class="blog-item box card border primary-font-pale mx-height-300 mh-10 mv-10" ${boxStyle}>
        <div class="container horizontal box">
            ${image}
            <div class="container vertical box ml-10">
                <h3>${shortText(blog[1], 30)}</h3>
                ${catHtml}
                <small class="text-small text-secondary">${timeSince(
                  new Date(blog[2])
                )}</small>
                <p class="p-10">${shortText(blog[6], 60)}</p>
                ${buttonHtml}
            </div>
        </div>
    </div>
        `;
    } else {
      // for vertical
      html += `
    <div class="blog-item box card border primary-font-pale mx-width-300 mh-10 mv-10" ${boxStyle}>
        <div class="container vertical box">
            ${image}
            <h3>${shortText(blog[1], 30)}</h3>
            ${catHtml}
            <small class="text-small text-secondary">${timeSince(
              new Date(blog[2])
            )}</small>
            <p class="p-10">${shortText(blog[6], 100)}</p>
            ${buttonHtml}

        </div>
    </div>
        `;
    }
  }
  html += `</div>`;

  // done
  html += "</div>";

  my_content.innerHTML = html;
}

function setUpNav(parcelNav) {
  let html = "";
  let current = getParameter("r", "profile");
  for (let j = 1; j < parcelNav.length; j++) {
    let nav = parcelNav[j];
    let page = nav[3] || "page.html";
    html += `<a href="${page}?r=${nav[2]}" class="${
      current === nav[2] ? "active" : ""
    } home nav-item btn small btn-primary-dark">${nav[1]}</button>`;
  }
  my_nav.innerHTML = html;
}

function setUpNested(parcelData) {
  let html = "";
  for (let j = 1; j < parcelData.length; j++) {
    let data = parcelData[j];
    let ui = data[0];
    let title = data[1];
    let parcelType = data[2];
    let parcel = data[3];
    html += "<div class='box center wrap mb-30'>";
    if (title !== "") {
      html += `<h2 id="profile-title mt-20">${title}</h2><hr>`;
    }
    if (ui === "html") {
      html += parcel;
    }
    // any others
    else {
      // grid or others
      html += giveMeGridHtml(parcel);
    }
    html += "</div>";
  }
  my_content.innerHTML = html;
}

function giveMeAllImages() {}

function giveMeGridHtml(parcelData) {
  let html = '<div class="box wrap center horizontal p-20">';
  for (let j = 1; j < parcelData.length; j++) {
    parcel = parcelData[j];
    let singularHtml =
      '<div class="min-width-150 min-height-100 box vertical center border card border secondary-pale mh-10 mv-10">';
    for (let i = 1; i < parcel.length - 1; i += 2) {
      let entries = parcel[i].split("|");
      let show_arr = new String(parcel[i + 1]).split("|");
      if (entries[0] === "parcent") {
        let value = parseFloat(show_arr[0].trim()) * 10;
        show_arr[0] = value ? value + "%" : show_arr[0];
      }
      if (entries[0] === "button") {
        singularHtml += `<a href="${show_arr[1]}" class="btn mv-10 mh-10 ${entries[1]}">${show_arr[0]}</a>`;
      } else if (entries[0] === "img") {
        singularHtml +=
          '<img src="' +
          show_arr[0] +
          '" alt="img" class="img mv-10 ' +
          entries[1] +
          '" />';
      } else {
        singularHtml +=
          '<p class="mh-10 ' + entries[1] + '">' + show_arr[0] + "</p>";
      }
    }
    singularHtml += "</div>";
    html += singularHtml;
  }
  return html + "</div>";
}

function setupBefore() {
  showElement(my_content);
  hideElement(loading_ground);
  toggleAlertBox(false);
  toggleFullView(false);
}

function toggleAlertBox(shown, alert = {}) {
  if (!shown) {
    hideElement(alertbox);
    return;
  }
  let title = alert["title"] || "Error";
  let message = alert["message"] || "";
  let button1_text = alert["button1_text"] || "OK";
  let button2_text = alert["button2_text"] || "";
  let button1_handler =
    alert["button1_handler"] ||
    function () {
      toggleAlertBox(false);
    };
  let button2_handler = alert["button2_handler"] || null;
  const button2 = document.querySelector("#error-alert #error-button2");
  const button1 = document.querySelector("#error-alert #error-button");

  document.querySelector("#error-alert #error-title").innerHTML = title;
  document.querySelector("#error-alert #error-body").innerHTML = message;

  button1.innerHTML = button1_text || "OK";
  button1.addEventListener("click", button1_handler);
  showElement(button1);

  if (button2_handler === null) {
    hideElement(button2);
  } else {
    button2.innerHTML = button2_text || "Cancel";
    button2.addEventListener("click", button2_handler);
    showElement(button2);
  }

  showElement(alertbox);
}

function handleError(message, title = "") {
  toggleFullView(false);
  hideElement(my_content);
  toggleAlertBox(true, {
    message,
    title,
    button1_text: "Go to main",
    button1_handler: function () {
      location.href = "index.html";
    },
    button2_text: "Reload",
    button2_handler: function () {
      location.reload();
    },
  });
}

function dataValidation(data) {
  let errorMessage = "Please reload the page or go to main";
  if (!data) {
    handleError(errorMessage, "Invalid data");
    return false;
  }
  if (Object.keys(data).length === 0) {
    handleError(errorMessage, "Empty data");
    return false;
  }
  if (data.status === false) {
    handleError(errorMessage, data.message || "Server status false");
    return false;
  }
  if (Object.keys(data.data).length === 0) {
    handleError(errorMessage, "Empty data");
    return false;
  }
  return true;
}

function setUpNow(data) {
  setupBefore();

  try {
    if (dataValidation(data)) {
      let parcelData = data.data.data;
      let parcelNav = data.data.nav;
      let type = data.data.data[0][0];
      setUpNav(parcelNav);
      if (type === "nested") {
        setUpNested(parcelData);
      } else if (type === "blog") {
        setUpBlog(parcelData, data.data.blog);
      } else if (type === "custom-blog") {
        setUpCusBlog(parcelData, data.data.blog);
      } else {
        // text, progress, url, parcent
        let html = giveMeGridHtml(parcelData);
        my_content.innerHTML = html;
      }
    }
  } catch (error) {
    let errorMessage = "Please reload the page or go to main";

    handleError(errorMessage, error.message);
    return false;
  }
}

function prepareURL() {
  let raw = getRawParameters();
  return url + raw;
}

function start() {
  toggleFullView(false);
  toggleAlertBox(false);
  hideElement(my_content);
  showElement(loading_ground);

  let starturl = prepareURL();
  fetch(starturl)
    .then((res) => res.json())
    .then((json) => {
      setUpNow(json);
    });
}

// let sampleData3={
//     status: true,
//     message: 'blah',
//     data:{
//         nav:[
//             [],
//             [1, "Blogs", "blog"],
//             [2, "Profile", "profile"],
//             [3, "Projects", "projects"],
//         ],
//         blog:{
//             // total pages, page per, page index, sort,
//             total_page: 5,
//             per: 10,
//             page: 1,
//             sort: 1,
//         },
//         data:[
//             ['blog', 'title'],
//             [1,"My First Blog", "12/11/2021", "coverphoto","Lorem ipsum dolor sit amet consectetur, adipisicing elit. Maxime corrupti quasi eos, ratione quidem sequi, ducimus ex ea quod non ullam voluptatibus provident aperiam numquam accusamus a laborum nesciunt debitis."],
//             [2,"My Second Blog", "12/11/2021", "coverphoto", "Hello world"],
//             [3,"My Third Blog", "12/11/2021", "coverphoto", "Lorem ipsum dolor sit amet<br>Example Code:<br><pre>print('hello')</pre> <br>consectetur adipisicing elit. Magnam laborum, nostrum modi porro amet libero asperiores possimus veritatis laboriosam nihil commodi? A tempora neque officia beatae, dolor quod ipsa temporibus quas fugiat sequi dicta commodi exercitationem harum nesciunt dolores voluptatem aliquid molestiae obcaecati est! Velit, hic! A id, deleniti, iusto perferendis at ex consequuntur quam nobis animi esse pariatur nihil illum harum quis, incidunt quasi qui? Repudiandae cumque sint, dolor iure cum aut accusantium minus illo animi ad ducimus odio soluta rerum vero eligendi a! Ab quidem, quis inventore dolore illo sequi, eius laboriosam illum repellendus laborum ipsa est pariatur. Labore officiis, repellendus ipsam vel vitae harum molestias aliquid autem. Molestias, consequuntur ratione. Molestias, ipsa a. Deserunt, labore! Praesentium consequatur vero provident aperiam iste dicta necessitatibus sapiente! Similique consequuntur quaerat quae ea eius iusto aperiam alias laborum excepturi molestiae illum autem accusantium, perspiciatis quia quo non modi incidunt ipsum voluptatibus vitae explicabo praesentium! Nostrum, ut. Natus, officiis saepe. Omnis tempora veritatis libero accusamus non porro corporis, dolorum ullam amet illo quos minus suscipit tenetur quod eaque praesentium! Dicta, adipisci veritatis! Fugiat labore est veritatis iusto quaerat accusamus molestias nisi eveniet sint odio sequi consequuntur explicabo qui fuga provident cupiditate ducimus, dolorum molestiae placeat. Dicta maiores corrupti ex sunt natus illum nulla perferendis, suscipit molestias laudantium culpa explicabo porro consequatur voluptatum nisi inventore fugiat, doloribus voluptate accusamus officiis quisquam rerum beatae! Perferendis delectus animi similique repudiandae ex. Quidem perspiciatis magnam iure minima ea corporis, voluptatum ratione est, modi repudiandae soluta et totam aliquam tempora iste saepe quas in nobis, fugit eum ipsum. Fuga, minima. Laborum voluptatum natus eveniet dolorum accusamus illum provident magnam sapiente illo iste, fugiat vero aliquam autem quaerat ab maiores at reprehenderit alias error modi. Facere aspernatur sunt, rerum fugiat tempore sit provident accusantium blanditiis natus, ratione eum!"],
//         ]
//     }
// }
let sampleData4 = {
  status: true,
  message: "blah",
  data: {
    nav: [
      [],
      [1, "Blogs", "blog"],
      [2, "Profile", "profile"],
      [3, "Projects", "projects"],
    ],
    blog: {
      // total pages, page per, page index, sort,
      total_page: 5,
      per: 10,
      page: 1,
      sort: 1,
    },
    data: [
      ["custom-blog", "My title"],
      [
        2,
        "My Second Blog",
        "12/11/2021",
        "./img/bg2.jpg",
        "horizontal|400|300",
        "android|kotlin|viewmodel|room|mvvm|rxjava",
        "Hello world Lorem| ipsum dolor sit amet| consectetur, adipisi|ing elit. Maxime corrupti quasi eos, ratione quidem sequi",
        "./img/bg2.jpg|./img/my_pic_1.png",
        "https://www.youtube.com/watch?v=3Be-GUwnClE",
        "",
        "text",
        "Download link:",
        "button|small",
        "Download Link|test.html",

        "img|tiny",
        "https://cdn-icons-png.flaticon.com/512/2965/2965327.png",
        "text",
        "Google Sheets",
      ],
      [
        1,
        "My First Blog",
        "12/11/2021",
        "./img/my_pic_1.png",
        "horizontal",
        "flutter",
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Maxime corrupti quasi eos, ratione quidem sequi, ducimus ex ea quod non ullam voluptatibus provident aperiam numquam accusamus a laborum nesciunt debitis.",
      ],
      [
        3,
        "My Third Blog",
        "12/11/2021",
        "./img/my_pic_2_500.png",
        "vertical",
        "web",
        "Lorem ipsum dolor sit amet<br>Example Code:<br><pre>print('hello')</pre> <br>consectetur adipisicing elit. Magnam laborum, nostrum modi porro amet libero asperiores possimus veritatis laboriosam nihil commodi? A tempora neque officia beatae, dolor quod ipsa temporibus quas fugiat sequi dicta commodi exercitationem harum nesciunt dolores voluptatem aliquid molestiae obcaecati est! Velit, hic! A id, deleniti, iusto perferendis at ex consequuntur quam nobis animi esse pariatur nihil illum harum quis, incidunt quasi qui? Repudiandae cumque sint, dolor iure cum aut accusantium minus illo animi ad ducimus odio soluta rerum vero eligendi a! Ab quidem, quis inventore dolore illo sequi, eius laboriosam illum repellendus laborum ipsa est pariatur. Labore officiis, repellendus ipsam vel vitae harum molestias aliquid autem. Molestias, consequuntur ratione. Molestias, ipsa a. Deserunt, labore! Praesentium consequatur vero provident aperiam iste dicta necessitatibus sapiente! Similique consequuntur quaerat quae ea eius iusto aperiam alias laborum excepturi molestiae illum autem accusantium, perspiciatis quia quo non modi incidunt ipsum voluptatibus vitae explicabo praesentium! Nostrum, ut. Natus, officiis saepe. Omnis tempora veritatis libero accusamus non porro corporis, dolorum ullam amet illo quos minus suscipit tenetur quod eaque praesentium! Dicta, adipisci veritatis! Fugiat labore est veritatis iusto quaerat accusamus molestias nisi eveniet sint odio sequi consequuntur explicabo qui fuga provident cupiditate ducimus, dolorum molestiae placeat. Dicta maiores corrupti ex sunt natus illum nulla perferendis, suscipit molestias laudantium culpa explicabo porro consequatur voluptatum nisi inventore fugiat, doloribus voluptate accusamus officiis quisquam rerum beatae! Perferendis delectus animi similique repudiandae ex. Quidem perspiciatis magnam iure minima ea corporis, voluptatum ratione est, modi repudiandae soluta et totam aliquam tempora iste saepe quas in nobis, fugit eum ipsum. Fuga, minima. Laborum voluptatum natus eveniet dolorum accusamus illum provident magnam sapiente illo iste, fugiat vero aliquam autem quaerat ab maiores at reprehenderit alias error modi. Facere aspernatur sunt, rerum fugiat tempore sit provident accusantium blanditiis natus, ratione eum!",
      ],
    ],
  },
};

// setUpNow(sampleData4);
// setupBefore();

start();
