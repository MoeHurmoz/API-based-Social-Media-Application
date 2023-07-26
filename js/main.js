// SETUP UI:
function setupUI() {
    const loginBtns = document.getElementById("login-btns");
    const logoutBtn = document.getElementById("logout-btn");
    const addBtn = document.getElementById("add-btn");

    if (localStorage.getItem("token")) {
        loginBtns.style.setProperty("display", "none", "important");
        logoutBtn.style.setProperty("display", "flex", "important");

        if (addBtn) {
            addBtn.style.setProperty("display", "flex", "important");
        };

        const userData = JSON.parse(localStorage.getItem("user"));
        const userImg = typeof userData.profile_image == "string" ? userData.profile_image : "../default-images/AV.JPG";

        document.getElementsByClassName("nav-userImg")[0].src = userImg;
        document.getElementById("nav-username").innerHTML = userData.username;
    } else {
        loginBtns.style.setProperty("display", "flex", "important");
        logoutBtn.style.setProperty("display", "none", "important");

        if (addBtn) {
            addBtn.style.setProperty("display", "none", "important");
        };
    };

    if (/(?:\/home$)|(?:\/home(?=[^\w]))/.test(window.location.href)) {
        getAllPosts();
    } else if (/\?postId\=/.test(window.location.href)) {
        getOnePost();
    } else if (/\?userId\=/.test(window.location.href)) {
        getUser();
        getUserPosts();
        toggleAddBtn();
    };
};


// SHOW OR HIDE "THREE DOTS" BUTTON:
function threeDotsBtn(postObj) {
    const isMyPost = currentUser() != null && postObj.author.id == currentUser().id;
    let threeDots = "";
    if (isMyPost) {
        threeDots = `<div class="dropdown mt-2" id="three-dots">
                            <button class="btn p-0" id="three-dots" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-three-dots"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><button class="dropdown-item" onclick="editPostBtnClicked('${encodeURIComponent(JSON.stringify(postObj))}')">Edit</button></li>
                                <li><button class="dropdown-item text-danger" onclick="deletePostBtnClicked(${postObj.id})">Delete</button></li>
                            </ul>
                        </div>`;
    };
    return threeDots;
};


// MODAL HIDE:
function modalHide(modalID) {
    const modal = document.getElementById(modalID);
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
};


// WHEN THE "PROFILE" IS CLICKED:
function profileClicked() {
    if (currentUser() != null) {
        window.location = `profile.html?userId="${currentUser().id}"`;
    } else {
        alertMessage("Login to view your profile", "warning", "bi bi-exclamation-triangle-fill")
    };
};


// WHEN THE "POST" IS CLICKED:
function postClicked(postId) {
    window.location = `postDetails.html?postId="${postId}"`;
};


// WHEN THE "USER" IS CLICKED:
function userClicked(userId) {
    window.location = `profile.html?userId="${userId}"`;
};


// WHEN THE "REGISTER" IS CLICKED:
function register() {
    toggleLoader();

    const profileImage = document.getElementById("rProfileImage").files[0];
    const name = document.getElementById("rName").value;
    const userName = document.getElementById("rUserName").value;
    const email = document.getElementById("rEmail").value;
    const password = document.getElementById("rPwd").value;

    let formData = new FormData();
    formData.append("image", profileImage);
    formData.append("name", name);
    formData.append("username", userName);
    formData.append("email", email);
    formData.append("password", password);

    axios.post(`${baseUrl}/register`, formData)
        .then(res => {
            modalHide("registerModal");

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            setupUI();
            if (/\?postId\=/.test(window.location.href)) {
                setupUIcommentsInput();
            };

            alertMessage("SUCCESSFULLY REGISTERED");
        })
        .catch(err => errMessage(err))
        .finally(() => toggleLoader(false));
};


// WHEN THE "LOGIN" IS CLICKED:
function login() {
    toggleLoader();

    const userName = document.getElementById("lUserName").value;
    const password = document.getElementById("lPwd").value;

    const body = {
        "username": userName,
        "password": password
    }

    axios.post(`${baseUrl}/login`, body)
        .then(res => {
            modalHide("loginModal");

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            setupUI();
            if (/\?postId\=/.test(window.location.href)) {
                setupUIcommentsInput();
            };

            alertMessage("LOGGED IN SUCCESSFULLY");
        })
        .catch(err => errMessage(err))
        .finally(() => toggleLoader(false));
};


// WHEN THE "LOGOUT" IS CLICKED:
function logoutBtnClicked() {
    document.getElementById("alert-modal-id").value = "";
    document.getElementById("alert-modal-message").innerHTML = "Are you sure you want to logout ?";
    document.getElementById("alert-modal-btn").innerHTML = "Logout";

    let editPostModal = new bootstrap.Modal(document.getElementById("logoutModal"), {});
    editPostModal.toggle();
};


// WHEN THE "DELETE" POST IS CLICKED:
function deletePostBtnClicked(postId) {
    document.getElementById("alert-modal-id").value = postId;
    document.getElementById("alert-modal-message").innerHTML = "Are you sure you want to delete the post ?";
    document.getElementById("alert-modal-btn").innerHTML = "Delete";

    let editPostModal = new bootstrap.Modal(document.getElementById("logoutModal"), {});
    editPostModal.toggle();
};


// WHEN THE "ADD (+)" POST IS CLICKED:
function addBtnClicked() {
    document.getElementById("post-id-input").value = "";
    document.getElementById("post-modal-title").innerHTML = "Create a new post";
    document.getElementById("post-title").value = "";
    document.getElementById("post-body").value = "";
    document.getElementById("post-modal-btn").innerHTML = "Create";

    let editPostModal = new bootstrap.Modal(document.getElementById("createPostModal"), {});
    editPostModal.toggle();
};


// WHEN THE "EDIT" POST IS CLICKED:
function editPostBtnClicked(postObj) {
    const post = JSON.parse(decodeURIComponent(postObj));

    document.getElementById("post-id-input").value = post.id;
    document.getElementById("post-modal-title").innerHTML = "Edit Post";
    document.getElementById("post-title").value = post.title;
    document.getElementById("post-body").value = post.body;
    document.getElementById("post-modal-btn").innerHTML = "Save";

    let editPostModal = new bootstrap.Modal(document.getElementById("createPostModal"), {});
    editPostModal.toggle();
};


// PROCESSING POST DELETION & LOGOUT:
function logoutOrDelPost() {
    toggleLoader();

    const id = document.getElementById("alert-modal-id").value;
    const isLogout = id == null || id == "";

    if (isLogout) {

        modalHide("logoutModal");
        localStorage.clear();
        setupUI();
        if (/\?postId\=/.test(window.location.href)) {
            setupUIcommentsInput();
        };
        toggleLoader(false);
        alertMessage("LOGGED OUT WAS DONE", "warning", "bi bi-exclamation-triangle-fill");

    } else {

        const headers = {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        };

        axios.delete(`${baseUrl}/posts/${id}`, headers)
            .then(res => {
                modalHide("logoutModal");
                if (/\?postId\=/.test(window.location.href)) {
                    window.location = "home.html";
                } else if (/(?:\/home$)|(?:\/home(?=[^\w]))/.test(window.location.href)) {
                    getAllPosts();
                    alertMessage("POST DELETED");
                } else if (/\?userId\=/.test(window.location.href)) {
                    getUser();
                    getUserPosts();
                    alertMessage("POST DELETED");
                };
            })
            .catch(err => {
                toggleLoader(false);
                errMessage(err);
            });
    };
};


// PROCESSING EDIT & CREATE POST:
function createOrEditPost() {
    toggleLoader();

    const postImg = document.getElementById("post-img").files[0];
    const postTitle = document.getElementById("post-title").value;
    const postBody = document.getElementById("post-body").value;

    let formData = new FormData();
    formData.append("image", postImg);
    formData.append("title", postTitle);
    formData.append("body", postBody);

    const headers = {
        headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    };

    let url = "";
    let message = "";

    const postId = document.getElementById("post-id-input").value;
    const isCreate = postId == null || postId == "";

    if (isCreate) {
        url = `${baseUrl}/posts`;
        message = "Post created successfully";
    } else {
        url = `${baseUrl}/posts/${postId}`;
        message = "Post updated successfully";
        formData.append("_method", "put");
    };

    axios.post(url, formData, headers)
        .then(res => {
            modalHide("createPostModal");
            if (/\?postId\=/.test(window.location.href)) {
                getOnePost();
            } else if (/(?:\/home$)|(?:\/home(?=[^\w]))/.test(window.location.href)) {
                window.scroll({ top: 100, left: 0, behavior: "instant" });
                getAllPosts();
            } else if (/\?userId\=/.test(window.location.href)) {
                getUser();
                getUserPosts();
            };
            alertMessage(message);
        })
        .catch(err => {
            toggleLoader(false);
            errMessage(err);
        });
};


// ALERT MESSAGE:
function alertMessage(message, type = "success", iconClass = "bi bi-check-circle-fill", timeout = 3000) {
    let alertElement = document.createElement("div");
    alertElement.setAttribute("id", "alert");
    alertElement.setAttribute("class", "show fade");
    alertElement.innerHTML = `<div class="alert alert-${type} d-flex align-items-center" role="alert"> 
                                <i class="${iconClass} me-2"></i> 
                                <div>${message}</div> 
                              </div>`;

    document.getElementById('alertDiv').appendChild(alertElement);

    setTimeout(() => {
        const hideAlertElement = bootstrap.Alert.getOrCreateInstance('#alert');
        hideAlertElement.close();
    }, timeout);
};


// ERROR MESSAGE:
function errMessage(err) {
    let message = err.response.data.message.replace(/\(.+\)/, "");
    switch (message) {
        case "The body field is required.":
            message = "Type the comment you want to send";
            break;
        case "The body field is required. ":
            message = "The content field is required";
            break;
        case "The image must be an image. ":
            message = "The image field is required";
            break;
        case "The name must be a string. ":
            message = "The name field is required";
            break;
        case "":
            message = err.message;
            break;
        default: message;
    };
    alertMessage(message, "danger", "bi bi-exclamation-triangle-fill", 10000);
};


// GET CURRENT USER:
function currentUser() {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    return currentUser;
};


// SHOW & HIDE "LOADER":
function toggleLoader(show = true) {
    if (show) {
        document.getElementById("lds-container").style.setProperty("display", "flex", "important");
    } else {
        document.getElementById("lds-container").style.setProperty("display", "none", "important");
    };
};


setupUI();