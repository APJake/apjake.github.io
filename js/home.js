const div_ground = document.querySelector('.ground');
let scrollTimer = null;
const nlink_home = document.querySelector('.nav-item.home');
const nlink_about = document.querySelector('.nav-item.about');
const nlink_contact = document.querySelector('.nav-item.contact');
const div_profile_img = document.querySelector('.profile-photo');
const div_profile_text = document.querySelector('.profile-text-box');
const divs_my_age = document.querySelectorAll('.my-age');
const profile_title = document.querySelector('#profile-title');
const profile_card = document.querySelector('#profile-card');
const profile_button_gp = document.querySelector('#profile-buttons');

const contact_title = document.querySelector('#contact-title');
const contact_inputs = document.querySelectorAll('.input');
const contact_submit = document.querySelector('#submit');
const contact_social = document.querySelector('.social');

const isAndroid = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);


let nav_links=[
    nlink_home,
    nlink_about,
    nlink_contact
];

let anim_level1_group=[
    profile_title, 
    profile_card, 
    profile_button_gp
]

let anim_level2_group=[
    contact_title, 
    ...contact_inputs, 
    contact_submit, 
    contact_social
]

let my_languages = [
    "Python", "Shell Script", "PHP", "Java", "JavaScript", "C++",
]
let my_frameworks = [
    "Laravel", "Django", "React Native", "NodeJS", "Bootstrap", "React"
]

divs_my_age.forEach(e=>{
    let dage = 21;
    let age = new Date().getFullYear()-2000;
    e.innerHTML=(age<dage)?dage: age;
})

function sectionsTrinkle(index){
    let length = nav_links.length;
    for(let i=0;i<length; i++){
        if(i===index){
            nav_links[i].classList.add('active');
        }else{
            nav_links[i].classList.remove('active');
        }
    }
}

function runOnLoad(){
    let scrollY = div_ground.scrollTop;
    let index = Math.floor(scrollY/window.innerHeight);
    sectionsTrinkle(index);
}

// scroll animation
div_ground.addEventListener('scroll', () => {

    // for animation
    let scrollY = div_ground.scrollTop;
    div_profile_img.setAttribute('style', 'transform: translateX('+(-1*scrollY)+'px)');
    div_profile_text.setAttribute('style', 'transform: translateX('+(1*scrollY)+'px)');
    if(!isAndroid){
        let forLevel1 = scrollY-(window.innerHeight*1);
        let forLevel2 = scrollY-(window.innerHeight*2);
        
        for (let index = 0; index < anim_level1_group.length; index++) {
            const element = anim_level1_group[index];
            let mult = Math.pow(-1, index);
            element.setAttribute('style', 'transform: translateX('+(mult*forLevel1)+'px)');
        }
        for (let index = 0; index < anim_level2_group.length; index++) {
            const element = anim_level2_group[index];
            let mult = Math.pow(-1, index);
            element.setAttribute('style', 'transform: translateX('+(mult*forLevel2)+'px)');
        }
    }
    if(scrollTimer!==null) clearTimeout(scrollTimer);
    scrollTimer=setTimeout(()=>{
        let index = Math.floor(scrollY/window.innerHeight);
        sectionsTrinkle(index);
    }, 50);
});

function smoothScroll(targetid) {
    let target = document.getElementById(targetid);
    target.scrollIntoView({behavior: "smooth"});
}


runOnLoad()