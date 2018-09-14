(function() {


  window.onbeforeunload = function(evt) {
    if (currentPostHash) {
      var message = 'Are you sure you want to leave?';
      if (typeof evt == 'undefined') {
        evt = window.event;
      }
      if (evt) {

        evt.returnValue = message;
      }
      return message;
    } else {
      return;
    }
  }


  console.log("ERERE");

  document.getElementById("btnGoogleSignIn").addEventListener("click", loginWithGoogle);

  document.getElementById("btnSignOut").addEventListener("click", signOut);

  document.getElementById("getNewPostID").addEventListener("click", getNewPostID);
  document.getElementById("upload").addEventListener("click", uploadIMG);
  document.getElementById("uploadHTML").addEventListener("click", uploadHTML);
  document.getElementById("bypassButton").addEventListener("click", getNewPostID_);
  document.getElementById("saveNewPostDetail").addEventListener("click", uploadDetails);



  var currentPostHash = null;
  var uid = "r9kPmxk6heWK2lf5TCdCIEFkqXB2";
  var userEmail = "chenliyang1024@gmail.com";
  var userSignedIn = false;

  const auth = firebase.auth();
  // console.log(auth);

  function loginWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithRedirect(provider);
  }

  function signOut() {
    auth.signOut().then(function() {
      // Sign-out successful.
    }).catch(function(error) {
      // An error happened.
    });
  }

  function getNewPostID_() {
    getNewPostID(false)
  }

  function getNewPostID(bypass = false) {

    if (!userSignedIn) {
      document.getElementById("errorMsgAuth").style.visibility = "visible";
      return;
    }


    if (document.getElementById("getNewPostID").classList.contains("goodButton") && bypass) {
      document.getElementById("errorMsgAuth").style.visibility = "hidden";
      document.getElementById("errorMsgGenerateID").style.visibility = "visible";
      return;
    }

    // bypass, comfirm to generate new one
    // or firstTime
    // set to default
    document.getElementById("errorMsgGenerateID").style.visibility = "hidden";
    document.getElementById("detailBlock").style.display = "none";
    document.getElementById("getNewPostID").classList.add("badButton");
    httpRESTAsync("GET", "https://us-central1-whatoreat-testdb.cloudfunctions.net/createNewPost", null, function(res) {
      if (res) {
        document.getElementById("newPostID").innerHTML = res;
        currentPostHash = res;
        document.getElementById("getNewPostID").classList.add("goodButton");
        document.getElementById("getNewPostID").classList.remove("badButton");
        document.getElementById("detailBlock").style.display = "flex";
      }
    })
  }

  function uploadDetails() {

    var author = document.getElementById("author").value;
    var title = document.getElementById("title").value;
    var snapshot = document.getElementById("snapshot").value;

    console.log(author, title, snapshot)
    var data = {
      fileName: currentPostHash,
      author: author,
      title: title,
      snapshot: snapshot
    }
    console.log(data)
    if (auth && title && snapshot) {
      httpRESTAsync("POST", "https://us-central1-whatoreat-testdb.cloudfunctions.net/newPostSnapShot", data, function(res) {
        console.log(JSON.parse(res));
      })
    }


  }


  async function uploadIMG() {
    if (!currentPostHash) {
      console.log("Er")
      document.getElementById("errorMsgUploadImage").style.visibility = "visible"
      return;
    }
    var Filelist = document.getElementById("selectedIMG").files;

    var numberOfFile = Filelist.length;

    var data = {
      fileName: currentPostHash,
      fileContent: {}
    }

    const readFileAsync = file => new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = evt => resolve(evt.target.result)
      reader.readAsDataURL(file)
    })

    for (let i = 0; i < numberOfFile; i++) {
      data.fileContent[Filelist[i].name] = await readFileAsync(Filelist[i])
      // data.fileContent[Filelist[i].name] = "!@#!@#!@#"
    }
    event.target.value = null

    console.log(data)

    httpRESTAsync("POST", "https://us-central1-whatoreat-testdb.cloudfunctions.net/uploadIMG", data, function(res) {
      console.log(JSON.parse(res));
    })

  }

  function uploadHTML() {
    if (!currentPostHash) {
      console.log("Er")
      document.getElementById("errorMsgUploadHTML").style.visibility = "visible"
      return;
    }
    var html = document.getElementById("selectedHTML").files[0];

    var reader = new FileReader();
    reader.onload = function() {
      var dataURL = reader.result;
      var data = {
        fileName: currentPostHash,
        fileContent: dataURL
      }
      console.log(data)
      httpRESTAsync("POST", "https://us-central1-whatoreat-testdb.cloudfunctions.net/uploadHTML", data, function(res) {
        console.log(JSON.parse(res));
      })

    };
    reader.readAsDataURL(html);
  }


  auth.onAuthStateChanged(function(user) {


    if (user) {
      document.getElementById("status").innerHTML = "IN";
      userSignedIn = true;
    } else {
      document.getElementById("status").innerHTML = "OUT";
      userSignedIn = false;
    }

    auth.getRedirectResult().then(function(result) {
      if (result.credential) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        if (result.user.uid != uid || result.additionalUserInfo.profile.email != userEmail) {
          auth.signOut().then(function() {
            // Sign-out successful.
          }).catch(function(error) {
            // An error happened.
          });
        } else {
          userSignedIn = true;
        }
      }
    }).catch(function(error) {

    });



  })

  function httpRESTAsync(type, theUrl, data, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callback(xmlHttp.responseText);
      else
        callback(null);
    }
    xmlHttp.open(type, theUrl, true); // true for asynchronous
    if (type == "POST") {
      // xmlHttp.setRequestHeader("Access-Control-Allow-Origin", "*");
      xmlHttp.setRequestHeader("Content-type", "application/json");
      xmlHttp.send(JSON.stringify(data));
    } else {
      xmlHttp.send(null);
    }
  }
})();