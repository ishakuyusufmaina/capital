import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
import {getFirestore, query, getDocs, where, collection, doc, enableIndexedDbPersistence, setDoc, getDoc} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import {getAuth, createUserWithEmailAndPassword, updateProfile, deleteUser, onAuthStateChanged, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCm_DSZaYVQCt0ubBwRkE9nOTryJayxH0w",
  authDomain: "school-in-the-box.firebaseapp.com",
  projectId: "school-in-the-box",
  storageBucket: "school-in-the-box.firebasestorage.app",
  messagingSenderId: "596350496353",
  appId: "1:596350496353:web:84c66c351700ddf0824420",
  measurementId: "G-3MGCDH4FRF"
};

// studentsConfig comes from config.js (loaded before this file)
const stdApp = initializeApp(studentsConfig, "std");
const stdDb = getFirestore(stdApp);

const schoolId = "capital";
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log("Multiple tabs open");
    } else if (err.code === 'unimplemented') {
      console.log("Browser not supported");
    }
  });

let teachersRef;
let teacherDoc;
let teachers;

var schoolGeneratedUsername;

/* ---------- Remember the role used for the last sign-in ---------- */
const LAST_KEY = "lastLogin";

function remember(info) {
  try { localStorage.setItem(LAST_KEY, JSON.stringify(info)); } catch (e) {}
}
function readLast() {
  try { return JSON.parse(localStorage.getItem(LAST_KEY)); } catch (e) { return null; }
}
function forgetLast() {
  try { localStorage.removeItem(LAST_KEY); } catch (e) {}
}

const STAFF_DEST = {
  admin: "admin/admin.html",
  teacher: "teacher/index.html",
  student: "student/index.html",
  guardian: "guardian/index.html",
  alumni: "alumni/index.html"
};

function directorDest(code) {
  if (code=="mcs001") return "admin/proprietress/index.html";
  if (code=="mcs002") return "admin/director/index.html";
  if (code=="mcs003") return "admin/director2/index.html";
}

async function onLoginSuccess(user, role) {

  if (!teachers[schoolGeneratedUsername]){
    if (!(user.email=="dev@teacher."+schoolId)){
      alert("Not on staff list, talk to admin if you think this is a mistake");
      return;
    }
  }

  const dest = STAFF_DEST[role];
  if (dest) {
    remember({ kind: "staff", role: role, email: user.email, username: schoolGeneratedUsername, dest: dest });
    window.location.href = dest;
  }
}

const logBtn = document.getElementById("loginBtn");
const logBtnS = document.getElementById("loginBtnS");
logBtn.onclick = signIn;

let reg = /.*@/;

async function signInAsStd(){
  const id = document.getElementById("email").value;
  const pin = document.getElementById("password").value;

  let q = query(
    collection(stdDb, "students"),
    where("pin", "==", Number(pin)),
    where("id", "==", id)
  );
  let docs = await getDocs(q);
  let std;
  docs.forEach(doc=>{
    std = doc.data()
  });
  if (std) {
    window.localStorage.setItem("id", std.id);
    remember({ kind: "student", role: "student", dest: "student.html" });
    window.location.href = "student.html";
  } else {
    alert("Wrong login credential. Meet your form master/class teacher for your ID and login PIN");
  }
}

async function signIn() {

  logBtn.textContent = "Logging..";
  const username = document.getElementById("email").value;
  if (isStudent(username)){
    await signInAsStd();
    logBtn.textContent = "Login"
    return;
  }
  teachersRef = doc(db, schoolId, "teachers");
  teacherDoc = await getDoc(teachersRef);
  teachers = teacherDoc.exists()? teacherDoc.data() : {};

  const email = username.replace(/@.*/, "")+`@teacher.${schoolId}`;

  schoolGeneratedUsername = username.replace(/@.*/, "");
  const role = username.replace(reg, "");
  const password = document.getElementById("password").value;


  if (role=="capital"){
    console.log("cap");

    signInWithEmailAndPassword(auth, email, password)
      .then( async (userCredential) => {
        let dRef = doc(db, schoolId, "directors");
        let dDoc = await getDoc(dRef);
        let dirs = dDoc.exists()? dDoc.data() : {};
        let code = dirs[schoolGeneratedUsername].username;

        const dest = directorDest(code);
        if (dest) {
          remember({ kind: "director", role: "director", email: email, username: schoolGeneratedUsername, dest: dest });
          window.location.href = dest;
        }
        return;
      })
      .catch( async (error) => {
        let dRef = doc(db, schoolId, "directors");
        let dDoc = await getDoc(dRef);
        let dirs = dDoc.exists()? dDoc.data() : {};

        let user = dirs[schoolGeneratedUsername];
        console.log(user.psw)
        if (user && user.psw==password){
          await createUserWithEmailAndPassword(auth, email, password);
          let createdUser = auth.currentUser;

          await updateProfile(createdUser, {displayName: user.name});
          alert(user.name);

          const dest = directorDest(user.username);
          if (dest) {
            remember({ kind: "director", role: "director", email: email, username: schoolGeneratedUsername, dest: dest });
            window.location.href = dest;
          }
          return;

        }
        alert("Login failed: " + error.code);
      });
    return;
  }


  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      onLoginSuccess(userCredential.user, role);
      logBtn.textContent = "Login";
    })
    .catch( async (error) => {
      let user = teachers[schoolGeneratedUsername];

      if (user && user.psw==password){
        await createUserWithEmailAndPassword(auth, email, password);
        let createdUser = auth.currentUser;

        await updateProfile(createdUser, {displayName: user.name});
        alert(user.name);
        onLoginSuccess(createdUser, role);
        return;

      }
      alert("Login failed: " + error.code);
      logBtn.textContent = "Login";
    });
}


function isStudent(id){
  return id.includes("/");
}

/* ---------- Already signed in? Continue with the last role ---------- */
function autoLogin() {
  const saved = readLast();
  if (!saved || !saved.dest) return;

  // If a destination page just sent the user back here, don't bounce them forward again
  const t = Number(sessionStorage.getItem("autoLoginAt") || 0);
  if (t && Date.now() - t < 15000) { sessionStorage.removeItem("autoLoginAt"); return; }

  const finish = () => {
    sessionStorage.setItem("autoLoginAt", String(Date.now()));
    window.location.replace(saved.dest);
  };

  if (saved.kind === "student") {
    // Students have no Firebase session; the stored id is their "signed in" state
    if (window.localStorage.getItem("id")) { logBtn.textContent = "Logging.."; finish(); }
    return;
  }

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    unsubscribe();
    if (!user || user.email !== saved.email) return;

    logBtn.textContent = "Logging..";
    try {
      const snap = await getDoc(doc(db, schoolId, saved.kind === "director" ? "directors" : "teachers"));
      const list = snap.exists() ? snap.data() : {};
      if (list[saved.username] || user.email == "dev@teacher." + schoolId) {
        finish();
        return;
      }
      forgetLast();   // no longer on the list
    } catch (e) {
      finish();       // couldn't check (e.g. offline): trust the existing session
      return;
    }
    logBtn.textContent = "Login";
  });
}
autoLogin();
