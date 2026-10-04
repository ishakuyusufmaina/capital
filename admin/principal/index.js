  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
  import {getFirestore, doc, setDoc, getDoc} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
  import {getAuth, updateProfile, signOut, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
      const firebaseConfig = {
  apiKey: "AIzaSyCm_DSZaYVQCt0ubBwRkE9nOTryJayxH0w",
  authDomain: "school-in-the-box.firebaseapp.com",
  projectId: "school-in-the-box",
  storageBucket: "school-in-the-box.firebasestorage.app",
  messagingSenderId: "596350496353",
  appId: "1:596350496353:web:84c66c351700ddf0824420",
  measurementId: "G-3MGCDH4FRF"
};


      const app = initializeApp(firebaseConfig);
      const analytics = getAnalytics(app);
      const auth = getAuth(app);
    const db = getFirestore(app);
const schoolId= "capital";
  const terms = ["first term", "second term", "third term"];

   var sessions = [];


  let sessionsRef = doc(db, schoolId, "sessions");
    let sessionsDoc = await getDoc(sessionsRef);
    if (sessionsDoc.exists()){
    let sessions =  sessionsDoc.data().sessions;
     sessions= sessions.sort((a, b)=>b.no - a.no);
    sess.innerHTML = sessions[0].year + ", " +terms[sessions[0].term]
        }

  let teachersDoc = await getDoc(doc(db, schoolId, "teachers"));



const adminFunctions = [
    "teachers",
    "students",
    "rc",
    "admins",

    "session",
    "section",
    "subjects",
    "auth",
    "monTAS",
    "monSA",

    "cta",
    "fma",
    "hosa",
    "hoda",
    "sbsm",
    "ygla",
    "tsa",
    "cbsm",
    "fmssm"

  ];

  let d = new Date();
  let year = d.getFullYear();
  let month = d.getMonth() + 1;
  let day = d.getDate();
  let sec = d.getSeconds()+1;
  let min = d.getMinutes()+1;
  let h = d.getHours()+1;
  date.innerHTML = `${day}/${month}/${year}`;

  function randint(low, high) {
    let num = Math.random();
    num = num*high + 1;
    num = Math.floor(num);
    if(num < low)
    num =  randint(low, high);
    return num
}

  function generate4N(){
    let n1 = randint(0,9);
    let n2 = randint(0,9);
    let n3 = randint(0,9);
    let n4 = randint(0,9);
    return `${n1}${n2}${n3}${n4}`;
  }
    generate.onclick = e=>{
      code.innerHTML = generate4N();
      save.style = "display: inline";
      save.textContent = "save";
    }
  save.onclick = async e=>{
    let user = auth.currentUser;
    if (!user) return;
    let email = user.email;
    let name = user.displayName;
    if (!name) {
     name = window.prompt("It seems there is no name on your account, update your name: ");
     if (!name) return;
      await updateProfile(user, {
        displayName: name
      })
    }
    let c = code.textContent;
    let authRef = doc(db, schoolId, "auth");
    let data = {};
    data[email] = {
      authorizer: name,
      code: c
    }
    await setDoc(authRef, data, {merge: true});
    save.textContent = "saved!"
    setTimeout(e=>save.style = "display: none", 1000);

  }
  signout.onclick = e=>{
    signOut(auth);
  }


  document.getElementById("close").onclick = _ => document.querySelector(".menu-container").classList.remove("show");
  menu.onclick = _ => document.querySelector(".menu-container").classList.add("show");

  document.body.onclick = e =>{

    if (e.target != menu )
    document.querySelector(".menu-container").classList.remove("show");

  }

  onAuthStateChanged(auth, async (user)=>{
    if (!user){
      window.location.href = "../../signin.html";
      return;
    }
    signout1.onclick = e=>{
      signOut(auth);
    }
    document.getElementById("switch").onclick = e=> {
      window.location.href = "../../teacher/index.html";
    }
    let name = user.displayName;
    if (!name){
      name = window.prompt("It seems there is no name on your account, update your name: ");
     if (name)
     updateProfile(user, {displayName: name})
    }
    username.textContent = name;
    let authRef = doc(db, schoolId, "auth");
    let authDoc = await getDoc(authRef);

    let authData = authDoc.exists()? authDoc.data()[user.email] : {}
    let c = authData? authData.code : "no code";
    code.textContent = c;

    let id = user.email.replace(/@.*/, "");
    let teachers = teachersDoc.data();
    let teacher = teachers[id];
    teacher.role ??={};
    teacher.role.hod ??={};
    let classes = teacher.role.hod.classes ?? [];
    if (classes.length)
    teacher.adminFunctions.push("fmHOD");

    classes = teacher.role.fm ?? [];
    if (classes.length){

      teacher.adminFunctions.push("fmssm");
      classesElm.textContent = classes;
    }


    teacher.role.hos ??={};
    let sections = teacher.role.hos.sections;
    localStorage.setItem("sections", JSON.stringify(sections));

  teacher.adminFunctions.forEach(fx=>{
    let elm = document.querySelector("."+fx);
    if (elm) elm.style = "display: block";
  })



  })


